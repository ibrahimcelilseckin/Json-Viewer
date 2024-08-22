
var leftEditor = CodeMirror.fromTextArea(document.getElementById("left-editor"), {
    lineNumbers: true,
    mode: "application/json",
    theme: "dracula",
    lineWrapping: true
});

var rightEditor = CodeMirror.fromTextArea(document.getElementById("right-editor"), {
    lineNumbers: true,
    mode: "application/json",
    theme: "dracula",
    readOnly: true,
    lineWrapping: true
});


document.querySelectorAll('.copy-button').forEach(function (button) {
    button.addEventListener('click', function () {
        var editor = this.closest('.editor-container').querySelector('.CodeMirror').CodeMirror;
        var content = editor.getValue();
        navigator.clipboard.writeText(content).then(function () {
            console.log('Kopyalandı');
        }).catch(function (err) {
            console.error('Kopyalama hatası: ', err);
        });
    });
});

document.querySelectorAll('.copy-button-right').forEach(function (button) {
    button.addEventListener('click', function () {
        
        var editor = document.querySelector('.right-editor .CodeMirror').CodeMirror;
        var content = editor.getValue();
        navigator.clipboard.writeText(content).then(function () {
            console.log('Copy!');
        }).catch(function (err) {
            console.error('Copy error!: ', err);
        });
    });
});

document.querySelector('.validate-button').addEventListener('click', function () {
    try {
        JSON.parse(leftEditor.getValue());
        

        alert("JSON succesful!");
    } catch (e) {
       
        let errorMessage = "invalid JSON: ";
        
        
        if (e instanceof SyntaxError) {
            errorMessage += e.message;  // ERROR Massage
        } else {
            errorMessage += "An unexpected error has occurred."; // General error message
        }
        
        alert(errorMessage);
    }
});

document.querySelectorAll('.delete-button').forEach(function (button) {
    button.addEventListener('click', function () {
        var editor = this.closest('.editor-container').querySelector('.CodeMirror').CodeMirror;
        if (editor === leftEditor) {
            leftEditor.setValue('');
        } else if (editor === rightEditor) {
            rightEditor.setValue('');
        }
    });
});


document.querySelector('.download-button').addEventListener('click', function () {
    var jsonContent = rightEditor.getValue();
    var blob = new Blob([jsonContent], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'OrganizedData.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

document.querySelector('.sample-button').addEventListener('click', function () {
    var sampleJson = `{
  "employees": {
    "employee": [
      {
        "id": "1",
        "firstName": "Tom",
        "lastName": "Cruise",
        "photo": "https://pbs.twimg.com/profile_images/735509975649378305/B81JwLT7.jpg"
      },
      {
        "id": "2",
        "firstName": "Maria",
        "lastName": "Sharapova",
        "photo": "https://pbs.twimg.com/profile_images/786423002820784128/cjLHfMMJ_400x400.jpg"
      },
      {
        "id": "3",
        "firstName": "James",
        "lastName": "Bond",
        "photo": "https://pbs.twimg.com/profile_images/664886718559076352/M00cOLrh.jpg"
      }
    ]
  }
}`;
    leftEditor.setValue(sampleJson);
});

function jsonToJsTree(node) {
    let result = [];
    for (const [key, value] of Object.entries(node)) {
        if (typeof value === 'object' && !Array.isArray(value)) {
            
            let item = {
                "text": key,
                "children": jsonToJsTree(value) 
            };
            result.push(item);
        } else if (Array.isArray(value)) {
            
            let item = {
                "text": key,
                "children": value.map((val, index) => {
                    if (typeof val === 'object') {
                        
                        return {
                            "text": `${key}[${index}]`,
                            "children": jsonToJsTree(val)
                        };
                    } else {

                        return {
                            "text": `${key}[${index}]: ${val}`,
                            "icon": "jstree-icon jstree-file"
                        };
                    }
                })
            };
            result.push(item);
        } else {
            
            let item = {
                "text": `${key}: ${value}`,
                "icon": "jstree-icon jstree-file"
            };
            result.push(item);
        }
    }
    return result;
}


// Tree button
document.querySelector('.tree-button').addEventListener('click', function () {
    try {
        var json = JSON.parse(leftEditor.getValue());
        var treeData = jsonToJsTree(json);

        
        if (!$('#tree-view').jstree(true)) {
            $('#tree-view').jstree({
                'core': {
                    'data': treeData
                }
            });
        } else {

            $('#tree-view').jstree(true).settings.core.data = treeData;
            $('#tree-view').jstree(true).refresh();
        }

        
        document.getElementById('tree-view').style.display = 'block';
        document.querySelector('.right-editor').style.display = 'none';

    } catch (e) {
        rightEditor.setValue("invalid JSON: " + e.message); // Show error message
    }
});


// File Upload
document.querySelector('.load-file-button').addEventListener('click', function () {
    document.getElementById('file-input').click();
});


document.querySelector('.toggle-view-button').addEventListener('click', function () {
    var treeView = document.getElementById('tree-view');
    var rightEditorContainer = document.querySelector('.right-editor');

    
    try {
        var json = JSON.parse(leftEditor.getValue());
        var minifiedJson = JSON.stringify(json);
        rightEditor.setValue(minifiedJson);
        
        
        treeView.style.display = 'none';
        rightEditorContainer.style.display = 'block';
    } catch (e) {
        rightEditor.setValue("invalid JSON: " + e.message); // ERROR Massage
    }
});

document.querySelector('.beautify-button').addEventListener('click', function () {
    try {
        
        var json = JSON.parse(leftEditor.getValue());

    
        var formattedJson = JSON.stringify(json, null, 2);

       
        rightEditor.setValue(formattedJson);

    } catch (e) {
        rightEditor.setValue("invalid JSON: " + e.message); // ERROR Massage
    }
});



document.getElementById('file-input').addEventListener('change', function (event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        leftEditor.setValue(text);
    };
    reader.readAsText(input.files[0]);
});

leftEditor.on("change", function () {
    try {
        var json = JSON.parse(leftEditor.getValue());
        var formattedJson = JSON.stringify(json, null, 2);
        rightEditor.setValue(formattedJson);

       
        var treeData = jsonToJsTree(json);
        $('#tree-view').jstree(true).settings.core.data = treeData;
        $('#tree-view').jstree(true).refresh();

    } catch (e) {
        rightEditor.setValue("invalid JSON: " + e.message); // ERROR Massage
    }
});

