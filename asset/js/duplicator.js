$(document).ready(function () {
    $("#run").click(run);
});

function run() {
    // Parse input files
    const parser = new WebVTTParser();
    const parsed = parser.parse($("#timings").val());
    
    if (parsed.errors.length > 0) {
        console.error("Parser error", parsed.errors);
        return;
    }
    
    var newCues = parsed.cues.map((cue) => cue);
    const groupedCues = group(parsed.cues);
    delete parsed;
    
    const untimed = $("#untimed").val();
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
    const output = serializer.serialize(newCues);
    $("#output").val(output);
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