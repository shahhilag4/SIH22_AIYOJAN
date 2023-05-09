var cal = {
  // (A) PROPERTIES
  // (A1) COMMON CALENDAR
  sMon: false, // Week start on Monday?
  mName: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ], // Month Names

  // (A2) CALENDAR DATA
  data: null, // tents for the selected period
  sDay: 0,
  sMth: 0,
  sYear: 0, // Current selected day, month, year

  // (A3) COMMON HTML ELEMENTS
  hMth: null,
  hYear: null, // month/year selector
  hForm: null,
  hfHead: null,
  hfDate: null,
  hfTxt: null,
  hfDel: null, // event form

  // (B) INIT CALENDAR
  init: () => {
    // (B1) GET + SET COMMON HTML ELEMENTS
    cal.hMth = document.getElementById("cal-mth");
    cal.hYear = document.getElementById("cal-yr");
    cal.hForm = document.getElementById("cal-event");
    cal.hfHead = document.getElementById("evt-head");
    cal.hfDate = document.getElementById("evt-date");
    cal.hfTxt = document.getElementById("evt-details");
    cal.hfDel = document.getElementById("evt-del");
    document.getElementById("evt-close").onclick = cal.close;
    cal.hfDel.onclick = cal.del;
    cal.hForm.onsubmit = cal.save;

    // (B2) DATE NOW
    let now = new Date(),
      nowMth = now.getMonth(),
      nowYear = parseInt(now.getFullYear());

    // (B3) APPEND MONTHS SELECTOR
    for (let i = 0; i < 12; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = cal.mName[i];
      if (i == nowMth) {
        opt.selected = true;
      }
      cal.hMth.appendChild(opt);
    }
    cal.hMth.onchange = cal.list;

    // (B4) APPEND YEARS SELECTOR
    // Set to 10 years range. Change this as you like.
    for (let i = nowYear - 10; i <= nowYear + 10; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = i;
      if (i == nowYear) {
        opt.selected = true;
      }
      cal.hYear.appendChild(opt);
    }
    cal.hYear.onchange = cal.list;

    // (B5) START - DRAW CALENDAR
    cal.list();
  },

  // (C) DRAW CALENDAR FOR SELECTED MONTH
  list: () => {
    // (C1) BASIC CALCULATIONS - DAYS IN MONTH, START + END DAY
    // Note - Jan is 0 & Dec is 11
    // Note - Sun is 0 & Sat is 6
    cal.sMth = parseInt(cal.hMth.value); // selected month
    cal.sYear = parseInt(cal.hYear.value); // selected year
    let daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(), // number of days in selected month
      startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // first day of the month
      endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(), // last day of the month
      now = new Date(), // current date
      nowMth = now.getMonth(), // current month
      nowYear = parseInt(now.getFullYear()), // current year
      nowDay =
        cal.sMth == nowMth && cal.sYear == nowYear ? now.getDate() : null;

    // (C2) LOAD DATA
    cal.data = {};
    // (C3) DRAWING CALCULATIONS
    // Blank squares before start of month
    let squares = [];
    if (cal.sMon && startDay != 1) {
      let blanks = startDay == 0 ? 7 : startDay;
      for (let i = 1; i < blanks; i++) {
        squares.push("b");
      }
    }
    if (!cal.sMon && startDay != 0) {
      for (let i = 0; i < startDay; i++) {
        squares.push("b");
      }
    }

    // Days of the month
    for (let i = 1; i <= daysInMth; i++) {
      squares.push(i);
    }

    // Blank squares after end of month
    if (cal.sMon && endDay != 0) {
      let blanks = endDay == 6 ? 1 : 7 - endDay;
      for (let i = 0; i < blanks; i++) {
        squares.push("b");
      }
    }
    if (!cal.sMon && endDay != 6) {
      let blanks = endDay == 0 ? 6 : 6 - endDay;
      for (let i = 0; i < blanks; i++) {
        squares.push("b");
      }
    }

    // (C4) DRAW HTML CALENDAR
    // Get container
    let container = document.getElementById("cal-container"),
      cTable = document.createElement("table");
    cTable.id = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);

    // First row - Day names
    let cRow = document.createElement("tr"),
      days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    if (cal.sMon) {
      days.push(days.shift());
    }
    for (let d of days) {
      let cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("head");
    cTable.appendChild(cRow);

    // Days in Month
    let total = squares.length;
    cRow = document.createElement("tr");
    cRow.classList.add("day");
    for (let i = 0; i < total; i++) {
      let cCell = document.createElement("td");
      if (squares[i] == "b") {
        cCell.classList.add("blank");
      } else {
        cCell.innerHTML = `<div name=${squares[i]} id=${squares[i]} class="dd">${squares[i]}</div>`;
        if (nowDay == squares[i]) {
          cCell.classList.add("today");
        }
        var oldClass;
        var oldCell;

        //Fetching Data from JSON
        var datastore;
        fetch("/calenderjsonall")
          .then(function (response) {
            return response.json();
          })
          .then(function (parsedJson) {
            for (var i = 0; i < Object.keys(parsedJson).length; i++) {
              const newval = Object.keys(parsedJson)[i].split("-", 3);
              const newvalue = newval.join("-");
              if (newvalue.length == 8) {
                if (
                  cCell.textContent.slice(0,2) == newvalue.slice(0, 1) &&
                  cal.sMth + 1 == newvalue.slice(2, 3) &&
                  cal.sYear == newvalue.slice(4, 9)
                ) {
                  datastore = parsedJson[Object.keys(parsedJson)[i]];
                  cal.data[cal.sDay] = datastore;
                  cal.hfTxt.value = true;
                  cal.hfHead.innerHTML = true;
                  document.getElementById("evt-details").innerHTML += datastore;
                  cCell.innerHTML +=
                    "<div" +
                    " name=" +
                    `"` +
                    datastore +
                    `"` +
                    "class='evt'>" +
                    datastore +
                    "</div>";
                }
              } else if (newvalue.length == 9 && cal.sMth + 1 < 10) {
                if (
                  cCell.textContent.slice(0,2) == newvalue.slice(0, 2) &&
                  cal.sMth + 1 == newvalue.slice(3, 4) &&
                  cal.sYear == newvalue.slice(5, 9)
                ) {
                  datastore = parsedJson[Object.keys(parsedJson)[i]];
                  
                  // cal.data[cal.sDay] = datastore;

                  // cal.hfTxt.value = true;
                  // cal.hfHead.innerHTML = true;
                  // document.getElementById("evt-details").innerHTML += datastore;
                  cCell.innerHTML +=
                    "<div" +
                    " name=" +
                    `"` +
                    datastore +
                    `"` +
                    "class='evt'>" +
                    datastore +
                    "</div>";
                }
                // cal.show(cCell);

              } else if (newvalue.length == 9 && cal.sMth > 10) {
                if (
                  cCell.textContent.slice(0,2) == newvalue.slice(0, 1) &&
                  cal.sMth + 1 == newvalue.slice(2, 4) &&
                  cal.sYear == newvalue.slice(5, 9)
                ) {
                  datastore = parsedJson[Object.keys(parsedJson)[i]];
                  cal.data[cal.sDay] = datastore;
                  cal.hfTxt.value = true;
                  cal.hfHead.innerHTML = true;
                  document.getElementById("evt-details").innerHTML = datastore;
                  cCell.appendChild(
                    "<div" +
                      " name=" +
                      `"` +
                      datastore +
                      `"` +
                      "class='evt'>" +
                      datastore +
                      "</div>"
                  );
                }
              } else {
                if (
                  cCell.textContent.slice(0,2) == newvalue.slice(0, 2) &&
                  cal.sMth + 1 == newvalue.slice(3, 5) &&
                  cal.sYear == newvalue.slice(6, 10)
                ) {
                  datastore = parsedJson[Object.keys(parsedJson)[i]];
                  cal.data[cal.sDay] = datastore;
                  cal.hfTxt.value = true;
                  cal.hfHead.innerHTML = true;
                  document.getElementById("evt-details").innerHTML = datastore;
                  cCell.innerHTML +=
                    "<div" +
                    " name=" +
                    `"` +
                    datastore +
                    `"` +
                    "class='evt'>" +
                    datastore +
                    "</div>";
                }
              }
            }
          });
        var flag = 1;
        cCell.onclick = () => {
          cal.show(cCell);

          cCell.classList.add("active");
          var newClass = squares[i];

          if (oldClass != newClass && flag > 1) {
            oldCell.classList.remove("active");
          }
          flag = flag + 1;
          oldClass = squares[i];
          oldCell = cCell;
        };
      }
      cRow.appendChild(cCell);
      if (i != 0 && (i + 1) % 7 == 0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }

    // (C5) REMOVE ANY PREVIOUS ADD/EDIT EVENT DOCKET
    cal.close();
  },

  // (D) SHOW EDIT EVENT DOCKET FOR SELECTED DAY
  show: (el) => {
    // (D1) FETCH EXISTING DATA
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
    let isEdit = cal.data[cal.sDay] !== undefined;
    // (D2) UPDATE EVENT FORM
    // cal.hfTxt.value = isEdit ? cal.data[cal.sDay] : "";
    // cal.hfHead.innerHTML = isEdit ? "EDIT EVENT" : "ADD EVENT";
    // cal.hfDate.innerHTML = `${cal.sDay} ${cal.mName[cal.sMth]} ${cal.sYear}`;
    // if (isEdit) {
    //   cal.hfDel.classList.remove("ninja");
    // } else {
    //   cal.hfDel.classList.add("ninja");
    // }
    // cal.hForm.classList.remove("ninja");
  },

  // (E) CLOSE EVENT DOCKET
  close: () => {
    cal.hForm.classList.add("ninja");
  },

  // (F) SAVE EVENT
  save: () => {
    cal.data[cal.sDay] = cal.hfTxt.value;
    var date1;

    var valuing = cal.data[cal.sDay];
    date1 = cal.sDay;

    var url = window.location.href;

    const lastSegment = url.split("/").pop();

    var formDataToSend = new FormData();
    formDataToSend.append("year", cal.sYear);
    formDataToSend.append("day", cal.sDay);
    formDataToSend.append("month", cal.sMth + 1);
    formDataToSend.append("eventinfo", cal.data[cal.sDay]);
    formDataToSend.append("aicte_code", "all");

    var request = new XMLHttpRequest();
    request.open("POST", "http://127.0.0.1:5000/crud");
    request.send(formDataToSend);
    var counter = 0;
    if (counter == 0) {
      document.getElementById(date1).parentElement.innerHTML +=
        "<div" +
        " name=" +
        `"` +
        valuing +
        `"` +
        "class='evt'>" +
        valuing +
        "</div>";
      location.reload(true);
      counter = counter + 1;
    } else {
      location.reload(true);
    }

    //   var fs = require('fs');
    //   fs.writeFile ("../../templates/commonpages/calender.json", JSON.stringify(date1), function(err) {
    //     if (err) throw err;
    //     }
    // );
    return false;
  },

  // (G) DELETE EVENT FOR SELECTED DATE
  del: () => {
    if (confirm("Delete event?")) {
      delete cal.data[cal.sDay];
      var url = window.location.href;
      const lastSegment = url.split("/").pop();
      var formDataToSend = new FormData();
      formDataToSend.append("year", cal.sYear);
      formDataToSend.append("day", cal.sDay);
      formDataToSend.append("month", cal.sMth + 1);
      formDataToSend.append("eventinfo", cal.data[cal.sDay]);
      formDataToSend.append("aicte_code", lastSegment);

      var request = new XMLHttpRequest();
      request.open("POST", "http://127.0.0.1:5000/deletedata");
      request.send(formDataToSend);
      location.reload(true);
      cal.list();
    }
  },
};
window.addEventListener("load", cal.init);
