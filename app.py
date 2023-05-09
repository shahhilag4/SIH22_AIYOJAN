# Importing Modules
from flask import Flask, render_template, redirect, url_for, request, session
from pymongo import MongoClient
from datetime import date, datetime
from calendar import monthrange, Calendar
import calendar
import bcrypt
import os
import json

app = Flask(__name__)
app.secret_key = "@13@6$$#ddfccv"

client = "mongodb+srv://hilag:hilag@cluster0.6y4qh.mongodb.net/sih?retryWrites=true&w=majority&ssl=true&ssl_cert_reqs=CERT_NONE"
cluster = MongoClient(client, authSource="admin")
db = cluster['sih']
adminlogin = db['login']
eventdetails = db['events']
collegedetails = db['collegedetails']


# End point for storing event details
@app.route("/crud", methods=['POST', 'GET'])
def crud():
    if request.method == 'POST':
        year = request.form.get('year')
        day = request.form.get('day')
        month = request.form.get('month')
        eventinfo = request.form.get('eventinfo')
        aicte_code = request.form.get('aicte_code')
        user = eventdetails.find_one({"day": day, "month": month, "year": year, "aicte_code": aicte_code})
        if user:
            eventdetails.delete_one({"day": day, "month": month, "year": year, "aicte_code": aicte_code})
        eventdetails.insert_one(
            {"day": day, "month": month, "year": year, "eventinfo": eventinfo, "aicte_code": aicte_code})
    return render_template("commonpages/homepage.html")


# Ending point for storing event details
@app.route("/deletedata", methods=['POST', 'GET'])
def deletedata():
    if request.method == 'POST':
        year = request.form.get('year')
        day = request.form.get('day')
        month = request.form.get('month')
        aicte_code = request.form.get('aicte_code')
        print(year)
        print(day)
        print(month)
        print(aicte_code)
        eventdetails.delete_one({"year": year, "day": day, "month": month, "aicte_code": aicte_code})
    return render_template("commonpages/homepage.html")


# Ending point for homepage
@app.route("/")
def homepage():
    if "college" in session:
        return redirect(url_for('collegeindex'))
    if "aicte" in session:
        return redirect(url_for('aicteindex'))
    return render_template("commonpages/homepage.html")


# Ending point for Logging Out User
@app.route("/logout")
def userLogout():
    session.clear()
    return redirect(url_for('homepage'))


# Ending point for displaying College list
@app.route("/collegelist")
def collegelist():
    collegedetailsdata = collegedetails.find()
    files = []
    for x in collegedetailsdata:
        files.append({
            "college_name": x['college_name'],
            "aicte_code": x['aicte_code'],
            "nirf_rank": x['nirf_rank'],
            "email": x['email'],
            "contact_no": x['contact_no'],
            "address": x['address'],
            "city": x['city'],
            "state": x['state'],
            "country": x['country'],
            "college_img": x['college_img'],
        })
    return render_template("commonpages/collegelist.html", files=files)
    # return render_template("commonpages/login.html")


@app.route("/collegelistaicte")
def collegelistaicte():
    collegedetailsdata = collegedetails.find()
    files = []
    if "aicte" in session:
        for x in collegedetailsdata:
            files.append({
                "college_name": x['college_name'],
                "aicte_code": x['aicte_code'],
                "nirf_rank": x['nirf_rank'],
                "email": x['email'],
                "contact_no": x['contact_no'],
                "address": x['address'],
                "city": x['city'],
                "state": x['state'],
                "country": x['country'],
                "college_img": x['college_img'],
            })
        return render_template("aicte_team/collegelistaicte.html", files=files)
    return render_template("commonpages/login.html")


# Ending point for displaying student calendar
@app.route("/studentcalendar")
def studentcalendar():
    return redirect(url_for('collegelist'))


# Ending point for after college login
@app.route("/<string:role>/<string:page>/<string:aicte_code>")
def college_details(role, page, aicte_code):
    if "college" in session:
        if role == "college" and page == "calendar":
            data = session["college"]
            events = eventdetails.find({"aicte_code": data})
            # print(type(events))
            eventrec = {}
            edate = "xx-xx-xxxx"
            eventrec[edate] = "Don't Touch"
            for evt in events:
                day = evt["day"]
                month = evt["month"]
                year = evt["year"]
                eventdate = day + '-' + month + '-' + year
                eventrec[eventdate] = evt["eventinfo"]
            json_object = json.dumps(eventrec, indent=4)
            # print(json_object)
            json_path = "templates/commonpages/" + data + ".json"
            with open(json_path, 'w') as f:
                json.dump(eventrec, f)
            return render_template("commonpages/calendar.html", a_code=aicte_code, points=json_object)
        elif role == "college" and page == "dashboard":
            return render_template("college/dashboard.html")
    return render_template("commonpages/login.html")


@app.route("/collegelistaicte/<string:aicte_code>")
def collegeaicte_details(aicte_code):
    if "aicte" in session:
        return render_template("college/dashboard.html")
    return render_template("commonpages/login.html")


# Ending point for aicte after login
@app.route("/aictecalendar")
def aictecalendar():
    if "aicte" in session:
        events = eventdetails.find({"aicte_code": "aictecalendar"})
        eventrec = {}
        edate = "xx-xx-xxxx"
        eventrec[edate] = "Don't Touch"
        for evt in events:
            day = evt["day"]
            month = evt["month"]
            year = evt["year"]
            eventdate = day + '-' + month + '-' + year
            eventrec[eventdate] = evt["eventinfo"]
        json_object = json.dumps(eventrec, indent=4)
        print(json_object)
        with open('templates/commonpages/calender.json', 'w') as f:
            json.dump(eventrec, f)
        return render_template("commonpages/calendar.html")
    return render_template("commonpages/login.html")


# End point for adding college in AICTE database
@app.route("/addcollege")
def addcollege():
    if "aicte" in session:
        return render_template("aicte_team/form.html")
    return render_template("commonpages/login.html")


# End point for displaying college details
@app.route("/<string:aicte_code>", methods=['POST', 'GET'])
def college_by_aictecode(aicte_code):
    collegedetailsdata = collegedetails.find_one({"aicte_code": aicte_code})
    files = []
    files.append({
        "college_name": collegedetailsdata['college_name'],
        "aicte_code": collegedetailsdata['aicte_code'],
        "nirf_rank": collegedetailsdata['nirf_rank'],
        "email": collegedetailsdata['email'],
        "contact_no": collegedetailsdata['contact_no'],
        "address": collegedetailsdata['address'],
        "city": collegedetailsdata['city'],
        "state": collegedetailsdata['state'],
        "country": collegedetailsdata['country'],
        "college_img": collegedetailsdata['college_img'],
    })
    return render_template("commonpages/college.html", files=files)


# End point for adding college in AICTE database
@app.route("/collegedata", methods=['POST', 'GET'])
def collegedata():
    if "aicte" in session and request.method == "POST":
        clg_name = request.form.get("college_name")
        aicte_code = request.form.get("aicte_code")
        nirf_rank = request.form.get("nirf_rank")
        email = request.form.get("email")
        contact_no = request.form.get("contact_no")
        address = request.form.get("address")
        city = request.form.get("city")
        state = request.form.get("state")
        country = request.form.get("country")
        clg_img = request.files['clg_img']

        file = clg_img.filename
        filename = file.split('.')
        filelength = len(filename)

        if filename[filelength - 1] != 'jpg' and filename[filelength - 1] != 'png' and filename[filelength - 1] != 'jpeg':
            err = "Upload file with .jpg or .jpeg or .png extension"
            return render_template("aicte_team/form.html", err=err)

        fileextension = filename[filelength - 1]
        clg_img.save(os.path.join("static/collegeimg", filename[0] + '.' + str(fileextension)))
        collegedetails.insert_one(
            {"college_name": clg_name, "aicte_code": aicte_code, "nirf_rank": nirf_rank, "email": email,
             "contact_no": contact_no, "address": address, "city": city, "state": state, "country": country,
             "college_img": clg_img.filename})

        hashpass = bcrypt.hashpw("12345".encode('utf-8'), bcrypt.gensalt())
        adminlogin.insert_one({'userid': aicte_code, 'password': hashpass, 'role': "college"})

        message = "Added Successfully!"
        return render_template("aicte_team/form.html", message=message)
    return render_template("commonpages/login.html")


@app.route("/collegeaictejson")
def collegeaictejson():
    if "college" in session:
        return render_template("commonpages/calender.json")
    return render_template("commonpages/login.html")


@app.route("/collegeaicte")
def collegeaicte():
    if "college" in session:
        return render_template("college/calenderaicte.html")
    return render_template("commonpages/login.html")


# Ending point for displaying Calendar
@app.route("/calendar/<string:aicte_code>")
def ccalendar():
    if "college" in session:
        data = session["college"]
        events = eventdetails.find({"aicte_code": data})
        print(type(events))
        return render_template("commonpages/calendar.html", aicte_code=data)
    return render_template("commonpages/login.html")


# Ending point for aicte index page
@app.route("/aicteindex")
def aicteindex():
    if "aicte" in session:
        return render_template("aicte_team/index.html")
    return render_template("commonpages/login.html")


@app.route("/calendercollege")
def calendercollege():
    if "college" in session:
        data = session["college"]
        url = "commonpages/" + data + ".json"
        return render_template(url)


@app.route("/calenderjson")
def calenderjson():
    if "aicte" in session:
        return render_template("commonpages/calender.json")

    if "college" in session:
        data = session['college']
        url = "commonpages/" + data + ".json"
        return render_template(url)

    return render_template("commonpages/login.html")

@app.route("/calenderjsonall")
def calenderjsonall():
    return render_template("commonpages/all.json")

# Ending point for college index page
@app.route("/collegeindex")
def collegeindex():
    if "college" in session:
        return render_template("college/index.html", a_code=session['college'])
    return render_template("commonpages/login.html")


@app.route("/studentcalendarclg/<string:aicte_code>")
def studentcalendarclg(aicte_code):
    events = eventdetails.find({"aicte_code": aicte_code})
    eventrec = {}
    edate = "xx-xx-xxxx"
    eventrec[edate] = "Don't Touch"
    for evt in events:
        day = evt["day"]
        month = evt["month"]
        year = evt["year"]
        eventdate = day + '-' + month + '-' + year
        eventrec[eventdate] = evt["eventinfo"]
    json_object = json.dumps(eventrec, indent=4)
    print(json_object)
    json_path = "templates/commonpages/" + aicte_code + ".json"
    with open(json_path, 'w') as f:
        json.dump(eventrec, f)
    return render_template("student/calendar.html")
    
@app.route("/studentcalendarall")
def studentcalendarall():
    events = eventdetails.find()
    # print(len(list(events)))
    eventrec = {}
    edate = "xx-xx-xxxx"
    eventrec[edate] = "Don't Touch"
    j=1
    for evt in events:
        day = evt["day"]
        month = evt["month"]
        year = evt["year"]
        eventdate =  day + '-' + month + '-' + year +  "-" + str(j)
        eventrec[eventdate] = evt["eventinfo"]
        j=j+1
    json_object = json.dumps(eventrec, indent=4)
    print(json_object)
    json_path = "templates/commonpages/" + "all" + ".json"
    with open(json_path, 'w') as f:
        json.dump(eventrec, f)
    return render_template("commonpages/calendar_all.html")


@app.route("/studentcalendarjson/<string:aicte_code>")
def studentcalendarjson(aicte_code):
    url = "commonpages/" + aicte_code + ".json"
    return render_template(url)


# Ending point for College and AICTE Team login
@app.route("/login", methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        userid = request.form['userid']
        password = request.form['password']
        role = request.form.get('role')

        user = adminlogin.find_one({'userid': userid})

        if user:
            if bcrypt.hashpw(password.encode('utf-8'), user['password']) == user['password']:
                if user['role'] == "college" and role == "college":
                    session['college'] = userid
                    return redirect(url_for('collegeindex'))
                elif user['role'] == "aicte" and role == "aicte":
                    session['aicte'] = userid
                    return redirect(url_for('aicteindex'))
        err = "Invalid Credentials"
        return render_template("commonpages/login.html", err=err)

        # hashpass = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        # adminlogin.insert({'userid': userid, 'password': hashpass, 'role': role})

    return render_template("commonpages/login.html")


def display_sundays(year, month):
    # Get the calendar for the given month and year
    cal = calendar.monthcalendar(year, month)
    sundaylist = []

    # Iterate over the weeks in the calendar
    for week in cal:
        # If there is a Sunday in the week,
        # Add that date in the list
        if week[calendar.SUNDAY] != 0:
            st = str(week[calendar.SUNDAY]) + "/" + str(month) + "/" + str(year)
            date_time_obj = datetime.strptime(st, '%d/%m/%Y').date()
            sundaylist.append(date_time_obj)
    return sundaylist

def display_saturday(year, month):
    # Get the calendar for the given month and year
    cal = calendar.monthcalendar(year, month)
    saturdaylist = []

    # Iterate over the weeks in the calendar
    for week in cal:
        # If there is a Sunday in the week,
        # Add that date in the list
        if week[calendar.SUNDAY] != 0:
            st = str(week[calendar.SATURDAY]) + "/" + str(month) + "/" + str(year)
            date_time_obj = datetime.strptime(st, '%d/%m/%Y').date()
            saturdaylist.append(date_time_obj)
    return saturdaylist

def get_datetime_range(year, month):
    nb_days = monthrange(year, month)[1]
    return [datetime.date(year, month, day) for day in range(1, nb_days+1)]


@app.route("/predictdate")
def predictbestdate():
    date_list = list(eventdetails.find())
    today_month = str(date.today().month)
    today_year = str(date.today().year)

    if len(today_month) == 1:
        today_month = "0" + today_month

    events_current_month = []

    for data in date_list:
        if data['month'] == str(today_month) and data['year'] == str(today_year):
            st = data['day'] + "/" + data['month'] + "/" + data["year"]
            date_time_obj = datetime.strptime(st, '%d/%m/%Y').date()
            events_current_month.append(date_time_obj)

    sundays_current_month = display_sundays(date.today().year, date.today().month)

    events_current_month.sort()

    found = "False"

    for presentdate in sundays_current_month:
        if presentdate not in events_current_month and date.today() < presentdate:
            found = "True"
            break

    if found != "True":
        saturday_current_month = display_saturday(date.today().year, date.today().month)
        for presentdate in saturday_current_month:
            if presentdate not in events_current_month and date.today() < presentdate:
                found = "True"
                break

    month = Calendar().itermonthdates(int(date.today().year), int(date.today().month))

    curr_month_date = [day for day in month if day.month == date.today().month]

    if found != "True":
        for presentdate in curr_month_date:
            if presentdate not in events_current_month and date.today() < presentdate:
                break

    return render_template("commonpages/displaybestdate.html", bestdate=presentdate)


if __name__ == '__main__':
    app.run(debug=True)
