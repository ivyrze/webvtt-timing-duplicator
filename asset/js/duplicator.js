$(document).ready(function () {
    $("#run").click(function () {
        if ($("form")[0].reportValidity()) {
            const readTimings = read($("#timings")[0].files[0]);
            const readUntimed = read($("#untimed")[0].files[0]);
            Promise.all([ readTimings, readUntimed ]).then(function (files) {
                $("#output").val(run(files[0], files[1]));
            }).catch(function () {
                console.error("File read error");
            });
        }
    });
    
    $("form input").on('change', function () {
        ($("form")[0].checkValidity()) ?
            $("#run").removeAttr("disabled") : $("#run").attr("disabled", "");
    })
});

function read(file) {
    const reader = new FileReader();
    const promise = new Promise(function (resolve, reject) {
        reader.addEventListener('load', function () {
            resolve(reader.result);
        });
        reader.addEventListener('error', function (event) {
            reject(event);
        });
        reader.readAsText(file);
    });
    
    return promise;
}

function run(timings, untimed) {
    // Parse input files
    const parser = new WebVTTParser();
    const parsed = parser.parse(timings);
    
    if (parsed.errors.length > 0) {
        console.error("Parser error", parsed.errors);
        return;
    }
    
    var newCues = parsed.cues.map((cue) => cue);
    const groupedCues = group(parsed.cues);
    delete parsed;
    
    const lines = untimed.split("\n").filter(function (line) {
        return line.trim() != '';
    });
    
    const groupedLines = group(lines);
    delete lines;
    
    // Input checking
    if (groupedCues.length != groupedLines.length) {
        console.error("Mismatched inputs", groupedCues, groupedLines);
        return;
    }
    
    // Mesh the timings and untimed script
    var flatIndex = 0;
    groupedCues.forEach(function (group, groupIndex) {
        const combinedLine = words(flatten(groupedLines[groupIndex]));
        var wordIndex = 0;
        const groupWordCount = groupWords(group).length;
        
        group.forEach(function (cue) {
            const ratio = words(cue.text).length / groupWordCount;
            const wordCount = Math.round(ratio * combinedLine.length);
            
            const partial = combinedLine.slice(wordIndex, wordIndex + wordCount).join(' ');
            newCues[flatIndex].text = newCues[flatIndex].tree.children[0].value = partial;
            
            flatIndex++;
            wordIndex += wordCount;
        });
    });
    
    // Serialize output file
    const serializer = new WebVTTSerializer();
    return serializer.serialize(newCues);
}

function separate(line) {
    const parts = line.match(/^(\w{1,30}):\s?(.+)/mu);
    return (parts) ? { speaker: parts[1].trim(), text: parts[2].trim() } : false;
}

function group(cues) {
    var groups = [];
    var tempGroup = [];
    var currentSpeaker;
    cues.forEach(function (cue, index) {
        const parts = separate(cue.text ?? cue);
        if (parts && parts.speaker != currentSpeaker) {
            // Speaker specified and changed
            if (index != 0) {
                groups.push(tempGroup);
                tempGroup = [];
            }
            currentSpeaker = parts.speaker;
        }
        tempGroup.push(cue);
    });
    
    if (tempGroup.length != 0) {
        groups.push(tempGroup);
    }
    
    return groups;
}

function flatten(group) {
    const lines = group.map(separate);
    var combined = lines[0].speaker + ":";
    lines.forEach(function (line) {
        combined += " " + line.text;
    });
    
    return combined;
}

function words(line) {
    return line.split(' ');
}

function groupWords(group) {
    var combined = [];
    group.forEach(function (cue) {
        combined = combined.concat(words(cue.text));
    });
    
    return combined;
}