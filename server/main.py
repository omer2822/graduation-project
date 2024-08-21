import io
import json
import networkx as nx
import matplotlib.pyplot as plt
import csv
from bson import json_util
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
app = Flask(__name__)
CORS(app)

connection_string = 'mongodb://localhost:27017/'
client = MongoClient(connection_string)
db = client.schedule
empCollection = db.employees

class Worker:
    def __init__(self, worker_id, name, skills, max_shifts=10):
        self._id = worker_id
        self._name = name
        self._skills = skills if skills else []
        self._max_shifts = max_shifts

    def add_skill(self, skill):
        if skill:
            self._skills.append(skill)

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @property
    def max_shifts(self):
        return self._max_shifts

    @max_shifts.setter
    def max_shifts(self, value):
        self._max_shifts = value

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def skills(self):
        return self._skills

    def to_dict(self):
        return {
            'Id': self.id,
            'Name': self.name,
            'Skills': self.skills,
            'Max': self.max_shifts
        }
    def __repr__(self):
        return f"{self._name}"
        return f"Worker(id={self._id}, name={self._name}, skills={self._skills})"


class Time:
    def __init__(self, day, skill, start=0, end=0, demand=0):
        self._day = day
        self._skill = skill
        self._start = start
        self._end = end
        self._demand = int(demand)
        self._time = f"{start}-{end}"

    @property
    def day(self):
        return self._day

    @property
    def numeric_day(self):
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return days.index(self._day) + 1

    @property
    def skill(self):
        return self._skill

    @day.setter
    def day(self, value):
        self._day = value

    @skill.setter
    def skill(self, value):
        self._skill = value

    @property
    def start(self):
        return self._start

    @start.setter
    def start(self, value):
        self._start = value
        self._time = f"{self._start}-{self._end}"

    @property
    def end(self):
        return self._end

    @end.setter
    def end(self, value):
        self._end = value
        self._time = f"{self._start}-{self._end}"

    @property
    def demand(self):
        return self._demand

    @demand.setter
    def demand(self, value):
        self._demand = int(value)

    @property
    def time(self):
        return self._time

    def __repr__(self):
        return f"{self.numeric_day}:{self._start}-{self._end}:{self._demand}-{self.skill}"
        return f"Time(day={self._day}, start={self._start}, end={self._end}, demand={self._demand})"

def load_data_from_csv1(file_path):
    workers = {}
    skills = set()

    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            worker_id = row['Id']
            worker_name = row['Name']
            if worker_id not in workers:
                workers[worker_id] = Worker(worker_id, worker_name)

            worker = workers[worker_id]


            # Add non-empty skills
            if row['Skill1']:
                worker.add_skill(row['Skill1'])
                skills.add(row['Skill1'])
            if row['Skill2']:
                worker.add_skill(row['Skill2'])
                skills.add(row['Skill2'])
            if row['Skill3']:
                worker.add_skill(row['Skill3'])
                skills.add(row['Skill3'])


    return list(workers.values()), skills

def load_data_from_csv2(file_path):
    days = {}
    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)

        for row in reader:
            day = row['Day']
            skill = row['Skill']
            start = row['Start']
            if (day,skill,start) not in days:
                days[(day,skill,start)] = Time(day,skill,start)
            time = days[((day,skill,start))]

            if row['End']:
                time.end = row['End']
            if row['Demand']:
                time.demand = row['Demand']


    return list(days.values())

def compute_max_flow(G, source, sink):
    flow_value, flow_dict = nx.maximum_flow(G, source, sink)
    return flow_value, flow_dict


def build_network(workers, demands, max_hours):
    G = nx.DiGraph()

    source = 'S'
    sink = 'T'

    # Add source and sink nodes
    G.add_node(source)
    G.add_node(sink)

    # Add edges from source to worker availability nodes with capacity equal to max_hours
    for worker in workers:
        G.add_edge(source, worker, capacity=max_hours)

    for worker in workers:
        for demand in demands:
            if is_worker_has_skill(worker, demand.skill):
                G.add_edge(worker, demand, capacity=1)
    for demand in demands:
        G.add_edge(demand,sink, capacity=demand.demand)

    return G

def is_worker_has_skill(worker, skill):
    if skill in worker.skills:
        return True
    else:
        return False
    #    return skill in worker.skills


def load_times_from_string(file):
    days = {}

    try:
        # Parse the JSON string into a list of dictionaries
        data = json.loads(file)
    except json.JSONDecodeError as e:
        print("Error decoding JSON:", e)
        return list(days.values())

    # Get the fieldnames from the keys of the first dictionary
    fieldnames = list(data[0].keys()) if data else []

    # Convert the list of dictionaries to a CSV-like string
    csv_string = "\n".join([",".join(fieldnames)] + [",".join(str(row[field]) for field in fieldnames) for row in data])

    # Split the CSV string into lines
    csv_data = csv_string.splitlines()

    # Parse the CSV data
    render = csv.DictReader(csv_data)

    for row in render:
        # print("Parsed Row:", row)

        day = row['Day']
        skill = row['Skill']
        start = row['Start']
        if (day, skill, start) not in days:
            days[(day, skill, start)] = Time(day, skill, start)
        time = days[(day, skill, start)]

        if row['End']:
            time.end = row['End']
        if row['Demand']:
            time.demand = row['Demand']

    return list(days.values())



def load_workers_from_string(file):
    workers = {}
    skills = set()

    try:
        # Parse the JSON string into a list of dictionaries
        data = json.loads(file)

    except json.JSONDecodeError as e:
        print("Error decoding JSON:", e)
        return list(workers.values()), skills

    # Get the fieldnames from the keys of the first dictionary
    fieldnames = list(data[0].keys()) if data else []

    # Convert the list of dictionaries to a CSV-like string
    csv_string = "\n".join([",".join(fieldnames)] + [",".join(str(row[field]) for field in fieldnames) for row in data])

    # Split the CSV string into lines
    csv_data = csv_string.splitlines()

    # Parse the CSV data
    render = csv.DictReader(csv_data)

    for row in render:
        # print("Parsed Row:", row)

        worker_id = row['Id']
        worker_name = row['Name']
        if worker_id not in workers:
            workers[worker_id] = Worker(worker_id, worker_name)

        worker = workers[worker_id]

        # Add non-empty skills
        if row['Skill1']:
            worker.add_skill(row['Skill1'])
            skills.add(row['Skill1'])
        if row['Skill2']:
            worker.add_skill(row['Skill2'])
            skills.add(row['Skill2'])
        if row['Skill3']:
            worker.add_skill(row['Skill3'])
            skills.add(row['Skill3'])

    # print('workers: ',workers.values())
    # print('skills:', skills)
    workers_dicts = [worker.to_dict() for worker in workers.values()]

    return list(workers.values()), skills


    return workers_dicts, skills

@app.route('/employees/delete', methods=['POST'])
def delete_employees():
    try:
        data = request.json.get('data')
        if not data:
            return jsonify({'error': 'No data provided in the request body.'}), 400

        result = empCollection.delete_many(data)
        return jsonify({'message': f"Deleted {result.deleted_count} documents."}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/employees/read', methods=['GET'])
def get_employees():
    try:
        employees = list(empCollection.find())
        return json.loads(json_util.dumps(employees))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/employees/upload', methods=['POST'])
def upload_file():
    data = request.json.get('data')
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    inserted_count = 0
    try:
        for entry in data:
            if 'Max' in entry:
                entry['Max'] = int(entry['Max'])

            # Check for duplicate before inserting
            if not empCollection.find_one({'Name': entry['Name']}):  # Change 'employee_id' to the field you want to check for duplicates
                empCollection.insert_one(entry)
                inserted_count += 1

        return jsonify({'message': f"Inserted {inserted_count} documents."})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add', methods=['POST'])
def add_doc():
    data = request.get_json()
    result = empCollection.insert_one(data)
    return jsonify({'result': str(result.inserted_id)})
@app.route('/api/schedule', methods=['POST'])
def scheduling():
    try:
        file1 = request.files['file1'].read().decode('utf-8')
        file2 = request.files['file2'].read().decode('utf-8')

        workers, skills = load_workers_from_string(file1)

        demands = load_times_from_string(file2)

        if len(workers) == 0 or len(demands) == 0:
            return jsonify({'assigments': [], 'kpis': {}})

        max_hours = 10

        G = build_network(workers, skills, demands, max_hours)
        flow_value, flow_dict = compute_max_flow(G, 'S', 'T')

        assignments = []
        covered_slots = set()
        total_hours_scheduled = 0
        overtime_hours = 0

        # print('workers', workers)
        for worker in workers:
            worker_hours=0
            for demand in demands:
                if demand in flow_dict[worker] and flow_dict[worker][demand] == 1:
                    assignments.append({'worker': worker.name, 'demand': str(demand)})
                    covered_slots.add(demand)
                    worker_hours += 1
                    if worker_hours > max_hours:
                        overtime_hours += worker_hours - max_hours
            total_hours_scheduled += worker_hours

        #Measures the percentage of shift demands that are covered by employees.
        schedule_coverage = len(covered_slots) / len(demands) * 100
        # Indicates the average utilization of employees relative to their maximum available working hours.
        employee_utilization = total_hours_scheduled / (len(workers) * max_hours) * 100
        #Measures the standard deviation of hours assigned to employees to evaluate how evenly shifts are distributed among them.
        shift_balance = round(np.std([sum(flow_dict[worker].values()) for worker in workers]), 2)
        #  Indicates the percentage of shift demands that are successfully assigned to employees with matching skills.
        skill_match_rate = len(assignments) / len(demands) * 100
        #Counts the number of shift demands that remain unassigned
        uncovered_skills = len(
            [demand for demand in demands if not any(flow_dict[worker].get(demand, 0) for worker in workers)])

        # print(schedule_coverage)

        kpis = {
            'schedule_coverage': schedule_coverage,
            'employee_utilization': employee_utilization,
            'overtime_hours': overtime_hours,
            'shift_balance': shift_balance,
            'skill_match_rate': skill_match_rate,
            'uncovered_skills': uncovered_skills,
        }
        # kpis = {}
        response = jsonify({'assignments': assignments, 'kpis': kpis})

        return response

    except Exception as e:
        print("Eroe",e)
        return jsonify({'error': str(e)},500)


eventCollection = db.events


def build_flow_network(workers, demands):
    G = nx.DiGraph()
    G.add_node('S', demand=-len(demands))
    G.add_node('T', demand=len(workers))
    for worker in workers:
        G.add_edge('S', worker._id, capacity=worker.max_shifts)
        for demand in demands:
            if demand[3] in worker.skills:
                G.add_edge(worker._id, demand[0], capacity=1)
    for demand in demands:
        G.add_edge(demand[0], 'T', capacity=int(demand[4]))


    return G
def load_workers_from_db(employees):
    workers = []
    for employee in employees:
        workers.append(Worker(employee['_id'], employee['Name'], [employee['Skill1'], employee['Skill2'], employee['Skill3']], employee['Max']))
    return workers

def load_times_from_db(events):
    demands = []
    for event in events:
        demands.append((event['_id'], event['start'], event['end'], event['skill'], event['demand']))
    return demands




@app.route('/schedule', methods=['POST'])
def schedule():
    try:
        # Fetch employees and events from MongoDB
        employees = list(empCollection.find({}))
        events = list(eventCollection.find({}))

        if len(employees) == 0 or len(events) == 0:
            return jsonify({'assignments': []})

        workers = load_workers_from_db(employees)
        demands = load_times_from_db(events)

        G = build_flow_network(workers, demands)
        flow_value, flow_dict = compute_max_flow(G, 'S', 'T')

        assignments = []
        # Iterate through events and build assignments

        # Iterate through demands (assuming it's a list of tuples)
        for event_tuple in demands:
            event_id = event_tuple[0]
            event_start = event_tuple[1]
            event_end = event_tuple[2]
            event_title = event_tuple[3]  # Assuming event title is the second element of the tuple
            event_demand = event_tuple[4]
            assigned_workers = []

            # Iterate through workers to find assigned workers for the event
            for worker in workers:
                if flow_dict.get(worker._id, {}).get(event_id, 0) == 1:
                    assigned_workers.append(str(worker._id))

            if assigned_workers:
                assignments.append({
                    'event_id': str(event_id),  # Convert event ID to string
                    'title': event_title,
                    'skill': event_title,
                    'start': event_start,
                    'end': event_end,
                    'demand': event_demand,
                    'assigned_workers': assigned_workers
                })
        employees_with_shifts = []
        for employee in employees:

            employee_id = str(employee['_id'])
            assigned_shifts = []
            for assignment in assignments:
                if employee_id in assignment['assigned_workers']:
                    assigned_shifts.append({
                        'event_id': assignment['event_id'],
                        'title': assignment['title'],
                        'skill': assignment['skill'],
                        'demand': assignment['demand']
                    })
            employees_with_shifts.append({
                'id': employee_id,
                'name': employee['Name'],
                'shifts': assigned_shifts,
                'max': employee['Max']
            })
        print(employees_with_shifts)
        response = jsonify({'assignments': assignments, 'employees': employees_with_shifts})
        return response


    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/save_schedule', methods=['POST'])
def save_schedule():
    try:
        data = request.json  # Assuming you're sending JSON data from the frontend
        assignments = data.get('assignments', [])

        # Update events collection with assigned employees
        for assignment in assignments:
            event_id = assignment['event_id']
            assigned_workers = assignment['assigned_workers']
            eventCollection.update_one(
                {'_id': ObjectId(event_id)},
                {'$set': {'employees': assigned_workers}}
            )

        # Update employees collection with shifts information
        employees = data.get('employees', [])
        for emp in employees:
            if '_id' in emp:
                emp_id = emp['_id']['$oid']
            elif 'id' in emp:
                emp_id = emp['id']
            shifts = emp['shifts']
            empCollection.update_one(
                {'_id': ObjectId(emp_id)},
                {'$set': {'shifts': shifts}}
            )

        return jsonify({'message': 'Schedule saved successfully.'}), 200

    except Exception as e:
        print('Error: ', e)
        return jsonify({'error': str(e)}), 500

@app.route('/events/delete', methods=['POST'])
def delete_events():
    try:
        data = request.json.get('data')
        if not data:
            return jsonify({'error': 'No data provided in the request body.'}), 400

        result = eventCollection.delete_many(data)
        return jsonify({'message': f"Deleted {result.deleted_count} documents."}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/events/read', methods=['GET'])
def get_events():
    try:
        employees = list(eventCollection.find())
        return json.loads(json_util.dumps(employees))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events/upload', methods=['POST'])
def upload_events():
    data = request.json.get('data')
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    inserted_count = 0
    try:
        for entry in data:
            # Check for duplicate before inserting
            if not eventCollection.find_one({'Name': entry['Name']}):  # Change 'employee_id' to the field you want to check for duplicates
                eventCollection.insert_one(entry)
                inserted_count += 1

        return jsonify({'message': f"Inserted {inserted_count} documents."})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events/add', methods=['POST'])
def add_event():
    data = request.get_json()
    result = eventCollection.insert_one(data)
    return jsonify({'result': str(result.inserted_id)})

@app.route('/events/upload_csv', methods=['POST'])
def upload_events_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Read the CSV file
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        reader = csv.DictReader(stream)

        events = []
        for row in reader:
            event = {
                'title': row['title'],
                'start': row['start'],
                'end': row['end'],
                'skill': row['skill'],
                'demand': int(row['demand']),
                'employees': []  # Assuming events created via CSV do not have employees initially
            }
            events.append(event)

        # Insert events into MongoDB
        result = eventCollection.insert_many(events)
        return jsonify({'message': f"Inserted {len(result.inserted_ids)} events."}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Route to update an event by ID
@app.route('/events/update/<string:event_id>', methods=['PUT'])
def update_event(event_id):
    try:
        # Retrieve the updated event data from the request body
        updated_event = request.json

        obj_id = ObjectId(event_id)

        if '_id' in updated_event:
            del updated_event['_id']
        # Update the event in MongoDB
        result = eventCollection.update_one(
            {'_id': obj_id},
            {'$set': updated_event}
        )
        print(result)

        # Check if the update was successful
        if result.modified_count == 1:
            return jsonify({'message': 'Event updated successfully'}), 200
        else:
            return jsonify({'message': 'Event not found'}), 404

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/reports', methods=['GET'])
def get_reports():
    try:
        # Fetch events from MongoDB
        events = list(eventCollection.find({}))  # Adjust to your collection name
        if not events:
            return jsonify({'reports': []})
            # Convert ObjectId to string for each event

        total_needed_hours = 0
        for event in events:
            event['_id'] = str(event['_id'])
            event['employees'] = [str(emp_id) for emp_id in event['employees']]

            # Calculate hours scheduled if not already defined
            start_time = datetime.fromisoformat(event['start'])
            end_time = datetime.fromisoformat(event['end'])
            duration_hours = (end_time - start_time).total_seconds() / 3600
            event['hours_scheduled'] = duration_hours

            demand = event.get('demand')
            total_needed_hours += duration_hours * demand

        # Calculate basic KPIs based on events
        total_events = len(events)
        total_demand = sum(event.get('demand', 0) for event in events)
        total_skills_matched = sum(1 for event in events if event.get('employees'))

        # Additional KPIs
        total_hours_scheduled = sum(event.get('hours_scheduled', 0) for event in events)
        total_employee_hours_scheduled = sum((event.get('hours_scheduled', 0) * len(event.get('employees'))) for event in events)
        average_hours_per_event = total_hours_scheduled / total_events if total_events > 0 else 0
        average_demand_per_event = total_demand / total_events if total_events > 0 else 0

        average_employee_hours_scheduled = total_employee_hours_scheduled / len(list(empCollection.find({})))
        # Example of more complex KPIs
        high_demand_events = [event for event in events if event.get('demand', 0) > 10]
        num_high_demand_events = len(high_demand_events)

        kpis = {
            'total_events': total_events,
            'total_demand': total_demand,
            'total_skills_matched': total_skills_matched,
            'total_needed_hours': total_needed_hours,
            'total_hours_scheduled': total_hours_scheduled,
            'total_employee_hours_scheduled': total_employee_hours_scheduled,
            'average_employee_hours_scheduled': average_employee_hours_scheduled,
            'average_hours_per_event': average_hours_per_event,
            'average_demand_per_event': average_demand_per_event,
            'num_high_demand_events': num_high_demand_events,
            # Add more KPIs as needed
        }

        return jsonify({'reports': events, 'kpis': kpis}), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


def r():
    # Load data from CSV
    file_path1 = 'file1.csv'
    file_path2 = 'file3.csv'

    workers, skills = load_data_from_csv1(file_path1)

    demands = load_data_from_csv2(file_path2)

    max_hours=10

    G = build_network(workers, skills, demands, max_hours)

    # Compute the maximum flow
    flow_value, flow_dict = compute_max_flow(G, 'S', 'T')
    #print results
    assignments = []
    for worker in workers:
        for demand in demands:
            if demand in flow_dict[worker] and flow_dict[worker][demand] == 1:
                assignments.append((worker,demand))
                print(f'{worker} is assigned to {demand}')

    #prepare edge labels with flow/capacity
    edge_labels = {}
    for u,v,data in G.edges(data=True):
        flow = flow_dict[u][v] if v in flow_dict[u] else 0
        capacity = data['capacity']
        edge_labels[(u,v)] = f'{flow}/{capacity}'


    for layer, nodes in enumerate(nx.topological_generations(G)):
        # 'multipartite_layout' expects the layer as a node attribute, so add the
        # numerical layer value as a node attribute
        for node in nodes:
            G.nodes[node]["layer"] = layer

    pos = nx.multipartite_layout(G, subset_key="layer", scale=10)
    fig, ax = plt.subplots(figsize=(12,8))

    nx.draw_networkx(G, pos=pos, ax=ax, with_labels=True, node_size=1000, node_color='lightblue')

    # draw edge labels
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels,font_size=10)

    #Highlight the assigments in red
    for worker, shift in assignments:
        nx.draw_networkx_edges(G, pos, edgelist=[(worker,shift)], edge_color='r',width=2,arrowstyle='-|>', arrowsize=20)

    ax.set_title("DAG layout in topological order")
    plt.axis('off')
    fig.tight_layout()
    plt.show()




if __name__ == '__main__':
    app.run(debug=True)
    #r()
    # G = nx.complete_graph(5)
    # nx.draw(G)
    # plt.show()