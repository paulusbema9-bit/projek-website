const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('D:/aplikasi/index.html', 'utf8');

const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (match) {
    let scriptContent = match[1];
    
    // Remove import statements because they aren't allowed in vm.Script by default
    scriptContent = scriptContent.replace(/import\s+.*?;\s*/g, '');
    
    try {
        new vm.Script(scriptContent);
        console.log("No syntax errors found by VM!");
    } catch (e) {
        console.error("Syntax Error found by VM:", e.message);
        
        // Find the line number
        try {
            // Write to a file and use child_process to run it and get the line number
            fs.writeFileSync('D:/aplikasi/vm_test.js', scriptContent);
            require('child_process').execSync('node -c D:/aplikasi/vm_test.js');
        } catch(err) {
            console.error("Node -c output:\n" + err.stderr.toString());
        }
    }
} else {
    console.log("No script module found");
}
