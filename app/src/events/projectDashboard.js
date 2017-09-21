var flagValidation = true;
var taskSectionId = 0;
var taskProjectId = 0;
var newTaskBtn = null;
var projectDashboardLinkClicked = false;
var newTaskOpenBtn = '';

document.getElementById('projectDashboardLink').addEventListener('click', function () {

  //  var oldProjects = [];
  document.getElementById('projectDashboard').style.display = '';
  document.getElementById('newCardProject').style.display = 'none';
  projectDashboardLinkClicked = true;
  removeUnusableLi();
  // oldProjects = document.getElementsByClassName('project');
  // for (var k = 1; k< oldProjects.length; k++) {
  //   var item = oldProjects[k];
  //   console.log(k);
  //   item.style.display = 'none';
  //   //item.parentNode.removeChild(item);
  // }
  var data = {};
  if (isLoggedIn) {
    var userEmail = localStorage.getItem('user');
    var info = document.getElementById('userLoggedIn');
    info.innerText = userEmail + ", Welcome to Your dashboard!";
    info.style.fontSize = "larger";
    info.style.display = 'block';

    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', BASE_URL + '/projects', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4 & xhttp.status == 200) {
        console.log(xhttp.responseText);
        data = JSON.parse(xhttp.responseText);
        drawProjectBoardCollection(data.data);
      }
    }
    xhttp.send();

  }
  else {
    info.style.display = 'none';
  }
});

document.getElementById('myProjectsLink').addEventListener('click', function () {

  document.getElementById('projectDashboard').style.display = '';
  document.getElementById('newCardProject').style.display = 'none';
  projectDashboardLinkClicked = false;

  removeUnusableLi();

  var headerConfig = {
    "Content-type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem('token')
  }
  var data = {};
  if (isLoggedIn) {
    var userEmail = localStorage.getItem('user');
    var info = document.getElementById('userLoggedIn');
    info.innerText = userEmail + ", Welcome to Your dashboard!";
    info.style.fontSize = "larger";
    info.style.display = 'block';

    // callAjax('GET', BASE_URL + '/user/projects', headerConfig, null, function(data){
    //   drawProjectBoardCollection(data.data);
    // });
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', BASE_URL + '/user/projects', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4 & xhttp.status == 200) {
        console.log(xhttp.responseText);
        data = JSON.parse(xhttp.responseText);
        drawProjectBoardCollection(data.data);
      }
    }
    xhttp.send();
  }
  else {
    info.style.display = 'none';
  }
});

document.getElementById('newProject').addEventListener('click', function () {
  document.getElementById('newCardProject').style.display = '';
  document.getElementById('alertInsertProject').style.display = 'none';
});

document.getElementById('projectTitleInput').addEventListener('change', fieldValidate);
document.getElementById('projectDescriptionInput').addEventListener('change', fieldValidate);
document.getElementById('projectDateInput').addEventListener('change', fieldValidate);

document.getElementById('editTask').addEventListener('click', function(){

document.getElementById('editTaskArea').style.display = 'block';
  // var select = document.getElementById('responsibleUserChange');
  // addResponsible(taskProjectId, document, select);
});

function fieldValidate() {

  console.log(this.id);
  console.log('Index of task');
  console.log(this.id.indexOf('task'));
  var input = this.value;
  var alert;
  if (this.id.indexOf('project') !== -1) {
    alert = document.getElementById('alertInsertProject');
  }
  if (this.id.indexOf('task') !== -1) {
    alert = document.getElementById('alertInsertTask');
  }

  console.log(alert);

  var correctDate = validateDueDate(input);

  if ((this.id == 'projectDateInput' || this.id == 'taskDueDateInput') && (!input || correctDate == false)) {

    alertMessage(alert, 'Please enter a valid date');
    flagValidation = false;
    return;
  } else {
    flagValidation = true;
  }

  if (validateInputField(input)) {

    alert.style.display = 'none';
    flagValidation = true;
  }
  else {

    alertMessage(alert, 'Please enter a valid information');
    flagValidation = false;
  }
  console.log(flagValidation);

};

drawProjectBoardCollection = function (data) {

  var oneBoard = document.getElementById('project');
  var container = document.getElementById('projectCollection');
  var fragment = document.createDocumentFragment();
  var projectTitle = document.getElementById('projectTitle');
  var projectDescription = document.getElementById('projectDescription');

  if (data && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      var cloned = document.createElement('li');
      cloned = document.getElementById('project').cloneNode(true);
      cloned.querySelector('h4').innerText = data[i].title;
      cloned.querySelector('h4').style.color = 'grey';
      cloned.querySelector('#assignMe').setAttribute('data_project_id', data[i].id);
      cloned.querySelector('#goToProject').setAttribute('data_project_id', data[i].id);
      cloned.querySelector('#goToProject').addEventListener('click', redirectToProject);
      cloned.querySelector('#assignMe').addEventListener('click', assignMe);
      cloned.querySelector('p').innerText = data[i].description;
      cloned.setAttribute('data_project_id', data[i].id);
      cloned.querySelector('#startDate').innerText = data[i].pr_start_date.split('T')[0];
      cloned.querySelector('#endDate').innerText = data[i].pr_due_date.split('T')[0];
      cloned.querySelector('#alertAssign').id = 'alertAssign_' + data[i].id;
      cloned.querySelector('#alertAssign').style.display = 'none';
      cloned.style.display = 'block';
      cloned.id = "project_" + data[i].id;
      console.log(cloned);
      if (projectDashboardLinkClicked) {
        cloned.querySelector('#goToProject').style.display = 'none';
      }
      fragment.appendChild(cloned);

    }
    container.appendChild(fragment);
  }
  projectDashboardLinkClicked = false;
};

document.getElementById('saveProject').addEventListener('click', function () {

  var projectTitle = document.getElementById('projectTitleInput').value;
  var projectDescription = document.getElementById('projectDescriptionInput').value;
  var dueDate = document.getElementById('projectDateInput').value;
  var alert = document.getElementById('alertInsertProject');

  if (flagValidation) {

    projectTitle = escapeString(projectTitle);
    projectDescription = escapeString(projectDescription);

    var reqObj = {
      title: projectTitle,
      description: projectDescription,
      startDate: getToday(),
      dueDate: dueDate
    };
    console.log(reqObj);
    url = BASE_URL + '/project';
    var headerConfig = {
      "Content-type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem('token')
    };

    callAjax('POST', url, headerConfig, reqObj, function (data) {
      var alert = document.getElementById('alertInsertProject');
      alert.classList.remove('alert-danger');
      alert.classList.add('alert-success');
      alertMessage(alert, data.message);
    });
  }
  else {
    alertMessage(alert, 'Please, enter a valid input data');
  }
});

document.getElementById('closeProject').addEventListener('click', function () {
  document.getElementById('newCardProject').style.display = 'none';
});

function assignMe() {

  //e.preventDefault();
  var _this = document.activeElement;
  console.log(_this);

  var projectLi = document.getElementById('project_' + _this.getAttribute('data_project_id'));
  var projectId = _this.getAttribute('data_project_id');
  var alert = document.getElementById('alertAssign_' + _this.getAttribute('data_project_id'));
  console.log(alert);
  var params = JSON.stringify({ projectId: projectId });
  var reqObj = { projectId: projectId };
  var data = {};
  if (isLoggedIn) {
    var headerConfig = {
      "Content-type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem('token')
    }
    callAjax('POST', BASE_URL + '/project/assign', headerConfig, reqObj, function (data) {
      alertMessage(alert, data.message);
    })
  }
};

document.getElementById('newSection').addEventListener('click', function () {

  document.getElementById('addSection').style.display = 'block';
  document.getElementById('newSectionTitle').style.display = 'block';
  this.style.display = 'none';

});

document.getElementById('addSection').addEventListener('click', addNewSection);

document.getElementById('newTaskOpen').addEventListener('click', saveProjectSectionId);

document.getElementById('viewTaskOpen').addEventListener('click', saveProjectSectionId);

function addNewSection() {

  document.getElementById('newSection').style.display = 'block';
  document.getElementById('newSectionTitle').style.display = 'none';
  this.style.display = 'none';
  var input = document.getElementById('newSectionTitle').value;
  var alert = document.getElementById('alertCreateSection');
  var sectionId = 0;

  if (validateInputField(input)) {
    input = escapeString(input);

    var headerConfig = {
      "Content-type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem('token')
    };
    var url = BASE_URL + '/section';

    var reqObj = {
      section: input,
      projectId: this.getAttribute('data_project_id')
    };
    var _document = document;
    var _this = this;

    callAjax('POST', url, headerConfig, reqObj, function (data) {

      // data.data is the section id retireved form DB after insert
      alert.classList.remove('alert-danger');
      alert.classList.add('alert-success');
      var newSection = _document.createElement('div');
      newSection = _document.getElementById('sectionDefault').cloneNode(true);
      _document.getElementById('project_board_' + _this.getAttribute('data_project_id')).appendChild(newSection);

      newSection.setAttribute('data_project_id', _this.getAttribute('data_project_id'));
      newSection.id = 'section_id_' + data.data;
      newSection.setAttribute('data_section_id', data.data);

      newSection.querySelector('#section_head').setAttribute('data_section_id', data.data);
      newSection.querySelector('#section_head').id = 'section_head_' + data.data;
      newSection.querySelector('#section_head_' + data.data).innerText = input;

      newSection.querySelector('#newTaskOpen').setAttribute('data_project_id', _this.getAttribute('data_project_id'));
      newSection.querySelector('#newTaskOpen').setAttribute('data_section_id', data.data);
      newSection.querySelector('#newTaskOpen').id = 'newTaskOpen_' + data.data;
      newSection.querySelector('#newTaskOpen_' + data.data).addEventListener('click', saveProjectSectionId);

      newSection.querySelector('#newSection').style.display = 'none';
      newSection.querySelector('#newSection').id = 'newSection_' + data.data;
      newSection.querySelector('#newSection_' + data.data).addEventListener('click', addNewSection);


      newSection.querySelector('#viewTaskOpen').setAttribute('data_project_id', _this.getAttribute('data_project_id'));
      newSection.querySelector('#viewTaskOpen').setAttribute('data_section_id', data.data);
      // newSection.querySelector('#viewTaskOpen_'+data.data).addEventListener('click', saveProjectSectionId);
      // newSection.querySelector('#viewTaskOpen').id = 'viewTaskOpen_' + data.data;

      //newSection.querySelector('#alertInsertTask').id = 'alertInsertTask_' + data.data;

      alertMessage(alert, 'Created section ' + input);
    });
  }
  else {
    alertMessage(alert, 'Please, fill the box ');
  }
}

function removeUnusableLi() {

  var oldProjects = document.getElementsByClassName('project');
  for (var k = 1; k < oldProjects.length; k++) {

    var item = oldProjects[k];
    console.log(k);
    item.style.display = 'none';
    //item.parentNode.removeChild(item);
  }
};

function drawSectionBody(sectionId, projectId, title, _document) {

  //_this is the pattern template
  var newSection = _document.createElement('div');
  newSection = _document.getElementById('sectionDefault').cloneNode(true);
  _document.getElementById('project_board_' + projectId).appendChild(newSection);

  newSection.setAttribute('data_project_id', projectId);
  newSection.id = 'section_id_' + sectionId;
  newSection.setAttribute('data_section_id', sectionId);

  newSection.querySelector('#section_head').setAttribute('data_section_id', sectionId);
  newSection.querySelector('#section_head').id = 'section_head_' + sectionId;
  newSection.querySelector('#section_head_' + sectionId).innerText = title;

  newSection.querySelector('#newTaskOpen').setAttribute('data_project_id', projectId);
  newSection.querySelector('#newTaskOpen').setAttribute('data_section_id', sectionId);
  newSection.querySelector('#newTaskOpen').id = 'newTaskOpen_' + sectionId;
  newSection.querySelector('#newTaskOpen_' + sectionId).addEventListener('click', saveProjectSectionId);

  newSection.querySelector('#newSection').style.display = 'none';
  newSection.querySelector('#newSection').id = 'newSection_' + sectionId;
  newSection.querySelector('#newSection_' + sectionId).addEventListener('click', addNewSection);


  newSection.querySelector('#viewTaskOpen').setAttribute('data_project_id', projectId);
  newSection.querySelector('#viewTaskOpen').setAttribute('data_section_id', sectionId);

  // var select = _document.getElementById('responsibleUser');
  //   addResponsible(projectId, _document, select);

};

function drawTaskBody(taskId, sectionId, section, taskTitle, taskStatus, statusId, taskDescription, _document) {

  var taskTemplate = null;

  //if (_document.getElementById('sectionDefault').querySelector('#cardDefault')) {
   if(sectionId == 0){
      taskTemplate = _document.getElementById('cardDefault');
   }
   else {
    taskTemplate = _document.querySelector('#section_id_' + sectionId).querySelector('#cardDefault');
   }
  // else  {
  //   taskTemplate = _document.getElementById('section_id_' + sectionId).querySelector('#cardDefault');
  // }
  console.log(taskTemplate)

  var newTask = _document.createElement('li');
  newTask = taskTemplate.cloneNode(true);
  console.log(newTask);
  //newTask.style.display = 'block';
  newTask.id = 'taskTitle_' + taskId;
  newTask.setAttribute('data_section_id', sectionId);
  newTask.setAttribute('data_task_id', taskId);

  newTask.querySelector('#taskTitle').id = 'taskTitle_' + taskId;
  newTask.querySelector('#taskTitle_' + taskId).setAttribute('data_task_id', taskId);
  newTask.querySelector('#taskTitle_' + taskId).innerText = taskTitle;
  newTask.querySelector('#taskTitle_' + taskId).style.display = 'block';

  newTask.querySelector('#taskDescription').id = 'taskDescription_' + taskId;
  newTask.querySelector('#taskDescription_' + taskId).setAttribute('data_task_id', taskId);
  newTask.querySelector('#taskDescription_' + taskId).innerHTML = taskDescription;
  newTask.querySelector('#taskDescription_' + taskId).style.display = 'block';

  newTask.querySelector('#btnStatus').id = 'btnStatus_' + taskId;
  newTask.querySelector('#btnStatus_' + taskId).setAttribute('data_task_id', taskId);
  newTask.querySelector('#btnStatus_' + taskId).innerHTML = taskStatus;
  newTask.querySelector('#btnStatus_' + taskId).style.backgroundColor = setTaskStatus(2);


  newTask.querySelector('#viewTaskOpen').id = 'viewTaskOpen_' + taskId;
  newTask.querySelector('#viewTaskOpen_' + taskId).addEventListener('click', fieldValidate);

  newTask.id = 'cardDefault_' + taskId;
  newTask.setAttribute('data_task_id', taskId);
  newTask.style.display = 'block';

  var sibling = null;
  if (section != 'default' || section != 'Default' || section != 'main' || section != 'Main') {
    sibling = _document.getElementById('section_id_' + sectionId).querySelector('#cardDefault');
  }
  else {
    sibling = _document.getElementById('sectionDefault').querySelector('#cardDefault');
  }
  var parent = sibling.parenNode;

  sibling.parentNode.insertBefore(newTask, sibling.nextSibling.nextSibling.nextSibling);

};

function redirectToProject() {

  document.getElementById('sectionDefault').style.display = 'block';
  document.getElementById('project_title_head').style.display = 'block';

  var projectId = this.getAttribute('data_project_id');
  console.log(projectId);

  var info = document.getElementById('userLoggedIn').innerText;
  var projectTitle = document.getElementById('project_' + projectId).querySelector('h4').innerText;
  document.querySelector('#project_title_head').innerText = localStorage.getItem('user') + ", Welcome to " + projectTitle;
  console.log(document.getElementById('project_board'));
  document.getElementById('project_board').setAttribute('data_project_id', projectId);
  document.getElementById('project_board').id = 'project_board_' + projectId;
  document.getElementById('addSection').setAttribute('data_project_id', projectId);
  document.getElementById('projectDashboard').style.display = 'none';
  document.getElementById('imgHomePage').style.display = 'none';
  document.getElementById('addSection').style.display = 'none';
  document.getElementById('newSectionTitle').style.display = 'none';
  document.getElementById('alertCreateSection').style.display = 'none';

  document.getElementById('sectionDefault').querySelector('#cardDefault').style.display = 'none';
  document.getElementById('sectionDefault').querySelector('#cardDefault').setAttribute('data_project_id', projectId);
  document.getElementById('sectionDefault').setAttribute('data_project_id', projectId);

  var selectResponsible = document.getElementById('responsibleUser');
  var selectChangeResponsible = document.getElementById('changeResponsibleUser');
  addResponsible(projectId, document, selectResponsible);
  addResponsible(projectId, document, selectChangeResponsible);
  
  // TO DO call ajax for retrieve all sections and tasks
  var headerConfig = {
    "Content-type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem('token')
  };
  var url = BASE_URL + '/sections';

  var reqObj = {
    projectId: projectId,
  };
  var _document = document;

  callAjax('POST', url, headerConfig, reqObj, function (data) {
    console.log(data.data)
    for (var i = 0; i < data.data.length; i++) {

      var item = data.data[i];
      var sectionId = item.sectionId;
      var len = data.data.length - 1;
      //while(item.sectionId == )
      if (i > 0 && item.sectionId == data.data[i - 1].sectionId) {
        drawTaskBody(item.taskId, item.sectionId, item.section, item.task, item.status, item.description, _document);
      }
      else {
        drawSectionBody(item.sectionId, projectId, item.section, _document);
        drawTaskBody(item.taskId, item.sectionId, item.section, item.task, item.status, item.statusId, item.description, _document);
      }
    }
  });

};

function saveProjectSectionId() {

  taskSectionId = this.getAttribute('data_section_id') || 0;
  taskProjectId = this.getAttribute('data_project_id') || 0;
  newTaskBtn = this;
  newTaskOpenBtn = this.id;
};

function addResponsible(projectId, _document, select) {

  var select = _document.getElementById('responsibleUser');
  console.log(select)
  var headerConfig = {
    "Content-type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem('token')
  };
  var url = BASE_URL + '/project/users';

  var reqObj = {
    projectId: projectId
  };

  callAjax('POST', url, headerConfig, reqObj, function (data) {

    var fragment = _document.createDocumentFragment();
    for (var i = 0; i < data.data.lentgh; i++) {

      var option = _document.createElement('option');
      option.value = data.data[i].user_id;
      option.text = data.data[i].firstName + ' ' + data.data[i].lastName;
      select.appendChild(option);
      console.log(select);
      console.log(option);

    }
    //select.appendChild(fragment);
  });
};