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

document.querySelectorAll('.copy-button-right').forEach(function (button) {
    button.addEventListener('click', function () {
        // Butona en yakın sağ editördeki CodeMirror örneğini bul
        var editor = document.querySelector('.right-editor .CodeMirror').CodeMirror;
        var content = editor.getValue();
        navigator.clipboard.writeText(content).then(function () {
            console.log('Kopyalandı');
        }).catch(function (err) {
            console.error('Kopyalama hatası: ', err);
        });
    });
});

document.querySelector('.validate-button').addEventListener('click', function () {
    try {
        // JSON verisini parse etmeye çalış
        JSON.parse(leftEditor.getValue());
        
        // JSON geçerli ise başarılı bir mesaj göster
        alert("JSON geçerli!");
    } catch (e) {
        // JSON geçersiz ise, hata mesajını ve detayları göster
        let errorMessage = "Geçersiz JSON: ";
        
        // JSON parse hatasında satır numarası bilgisi genellikle sağlanmaz
        // Bu yüzden, basit bir hata mesajı gösteriyoruz
        if (e instanceof SyntaxError) {
            errorMessage += e.message;  // Hata mesajını ekle
        } else {
            errorMessage += "Beklenmedik bir hata oluştu."; // Genel hata mesajı
        }
        
        alert(errorMessage);
    }
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

// JSON verisini JsTree formatına dönüştür
function jsonToJsTree(node) {
    let result = [];
    for (const [key, value] of Object.entries(node)) {
        if (typeof value === 'object' && !Array.isArray(value)) {
            // Nesne ise, alt düğümleri oluştur
            let item = {
                "text": key,
                "children": jsonToJsTree(value) // Alt nesneleri işlemek için rekürsif çağrı
            };
            result.push(item);
        } else if (Array.isArray(value)) {
            // Dizi ise, her bir öğeyi ayrı düğüm olarak ekle
            let item = {
                "text": key,
                "children": value.map((val, index) => {
                    if (typeof val === 'object') {
                        // Eğer dizi elemanı nesne ise, bu nesne için alt düğümler oluştur
                        return {
                            "text": `${key}[${index}]`,
                            "children": jsonToJsTree(val)
                        };
                    } else {
                        // Eğer dizi elemanı basit bir değer ise, bu değeri doğrudan ekle
                        return {
                            "text": `${key}[${index}]: ${val}`,
                            "icon": "jstree-icon jstree-file"
                        };
                    }
                })
            };
            result.push(item);
        } else {
            // Basit bir değer ise, direkt olarak ekle
            let item = {
                "text": `${key}: ${value}`,
                "icon": "jstree-icon jstree-file"
            };
            result.push(item);
        }
    }
    return result;
}


// Tree butonu 
document.querySelector('.tree-button').addEventListener('click', function () {
    try {
        var json = JSON.parse(leftEditor.getValue());
        var treeData = jsonToJsTree(json);

        // Eğer JsTree daha önce başlatılmadıysa başlatın
        if (!$('#tree-view').jstree(true)) {
            $('#tree-view').jstree({
                'core': {
                    'data': treeData
                }
            });
        } else {
            // Eğer JsTree daha önce başlatıldıysa, veriyi güncelle
            $('#tree-view').jstree(true).settings.core.data = treeData;
            $('#tree-view').jstree(true).refresh();
        }

        // Ağaç görünümünü göster, sağ editörü gizle
        document.getElementById('tree-view').style.display = 'block';
        document.querySelector('.right-editor').style.display = 'none';

    } catch (e) {
        rightEditor.setValue("invalid JSON: " + e.message); // Hata mesajını göster
    }
});


// Dosya yükleme butonu 
document.querySelector('.load-file-button').addEventListener('click', function () {
    document.getElementById('file-input').click();
});

// Minify butonu işlevi
document.querySelector('.toggle-view-button').addEventListener('click', function () {
    var treeView = document.getElementById('tree-view');
    var rightEditorContainer = document.querySelector('.right-editor');

    // Sol editörden JSON verisini al ve minify et
    try {
        var json = JSON.parse(leftEditor.getValue());
        var minifiedJson = JSON.stringify(json);
        rightEditor.setValue(minifiedJson);
        
        // Minify edildiğinde JsTree'yi gizle ve sağ editörü göster
        treeView.style.display = 'none';
        rightEditorContainer.style.display = 'block';
    } catch (e) {
        rightEditor.setValue("invalid JSON: " + e.message); // Hata mesajını göster
    }
});

document.querySelector('.beautify-button').addEventListener('click', function () {
    try {
        // Sol editörden JSON verisini al
        var json = JSON.parse(leftEditor.getValue());

        // JSON verisini formatla
        var formattedJson = JSON.stringify(json, null, 2);

        // Sağ editörde göster
        rightEditor.setValue(formattedJson);

    } catch (e) {
        rightEditor.setValue("Geçersiz JSON: " + e.message); // Hata mesajını göster
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

// Sol editördeki değişiklikleri sağ editöre aktar
leftEditor.on("change", function () {
    try {
        var json = JSON.parse(leftEditor.getValue());
        var formattedJson = JSON.stringify(json, null, 2);
        rightEditor.setValue(formattedJson);

        // Json verisi değiştiğinde JsTree'yi güncelle
        var treeData = jsonToJsTree(json);
        $('#tree-view').jstree(true).settings.core.data = treeData;
        $('#tree-view').jstree(true).refresh();

    } catch (e) {
        rightEditor.setValue("invalid JSON: " + e.message); // Hata mesajını göster
    }
});

