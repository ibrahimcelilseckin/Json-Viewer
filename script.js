// Kod editörlerini oluştur
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

// Kopyala butonu işlevi
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


// Sil butonu işlevi
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


// İndirme butonu işlevi
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

// Sample butonu 
document.querySelector('.sample-button').addEventListener('click', function () {
    var sampleJson = `{"name":"John Doe","age":30,"email":"john@example.com","address":{"street":"123 Main Street","city":"Anytown","zipcode":"12345"},"phoneNumbers":["+1234567890","+9876543210"]}`;
    leftEditor.setValue(sampleJson);
});


// Tree butonu 
document.querySelector('.tree-button').addEventListener('click', function () {
    try {
        var json = JSON.parse(leftEditor.getValue());
        var treeJson = JSON.stringify(json, null, 2);
        rightEditor.setValue(treeJson);
    } catch (e) {
        rightEditor.setValue("Geçersiz JSON");
    }
});

// Dosya yükleme butonu 
document.querySelector('.load-file-button').addEventListener('click', function () {
    document.getElementById('file-input').click();
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

// Sol editördeki değişiklikleri sağ editöre aktar
leftEditor.on("change", function () {
    try {
        var json = JSON.parse(leftEditor.getValue());
        var formattedJson = JSON.stringify(json, null, 2);
        rightEditor.setValue(formattedJson);
    } catch (e) {
        rightEditor.setValue("Geçersiz JSON");
    }
});
