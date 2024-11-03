let weights = [];
let bias = [];
let learningRate = 0.01;
let maxIterations = 1000;
let numClasses = 2;
let points = [];
let addingNode = false;

function updateClasses() {
    numClasses = parseInt(document.getElementById('num-classes').value);
    let nodeClassSelect = document.getElementById('node-class');
    nodeClassSelect.innerHTML = '';
    for (let i = 0; i < numClasses; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.text = `Class ${i}`;
        nodeClassSelect.add(option);
    }
    initializeWeights();
    console.log("Updated classes to:", numClasses);
}

function enableAddNode() {
    addingNode = true;
}

function addNode(event) {
    if (!addingNode) return;

    const rect = event.target.getBoundingClientRect();
    const x1 = (event.clientX - rect.left - 250) / 50;
    const x2 = (event.clientY - rect.top - 250) / 50;
    const label = parseInt(document.getElementById('node-class').value);

    points.push({ x1, x2, label });
    console.log("Added point:", { x1, x2, label });
    drawGraph();

    addingNode = false;
}

function trainModel() {
    learningRate = parseFloat(document.getElementById('learning-rate').value);
    maxIterations = parseInt(document.getElementById('iterations').value);

    initializeWeights();

    for (let iter = 0; iter < maxIterations; iter++) {
        let errors = 0;

        points.forEach(point => {
            let { x1, x2, label } = point;

            if (numClasses === 2) {
                const target = label === 0 ? -1 : 1;
                const prediction = predictBinary(x1, x2);
                
                if (target !== prediction) {
                    updateWeightsBinary(target, prediction, x1, x2);
                    errors++;
                }
            } else {
                for (let c = 0; c < numClasses; c++) {
                    const target = (label === c) ? 1 : -1;
                    const prediction = predict(x1, x2, c);
                    if (target !== prediction) {
                        updateWeights(target, prediction, x1, x2, c);
                        errors++;
                    }
                }
            }
        });

        if (errors === 0) break;

        console.log(`Iteration ${iter + 1}, Errors: ${errors}`);
    }

    drawGraph();
    drawDecisionBoundary();
}

function initializeWeights() {
    if (numClasses === 2) {
        weights = [Math.random() - 0.5, Math.random() - 0.5];
        bias = Math.random() - 0.5;
    } else {
        weights = Array.from({ length: numClasses }, () => [Math.random() - 0.5, Math.random() - 0.5]);
        bias = Array.from({ length: numClasses }, () => Math.random() - 0.5);
    }
    console.log("Initialized weights and biases:", weights, bias);
}

function predictBinary(x1, x2) {
    // Binary classification prediction
    const score = weights[0] * x1 + weights[1] * x2 + bias;
    return score >= 0 ? 1 : -1;
}

function updateWeightsBinary(target, prediction, x1, x2) {
    // Update weights and bias for binary classification
    const adjustment = learningRate * (target - prediction);
    weights[0] += adjustment * x1;
    weights[1] += adjustment * x2;
    bias += adjustment;
}

function predict(x1, x2, classIndex) {
    // Multi-class prediction using one-vs-all approach
    const score = weights[classIndex][0] * x1 + weights[classIndex][1] * x2 + bias[classIndex];
    return score >= 0 ? 1 : -1;
}

function updateWeights(target, prediction, x1, x2, classIndex) {
    // Update weights and bias for multi-class classification
    const adjustment = learningRate * (target - prediction);
    weights[classIndex][0] += adjustment * x1;
    weights[classIndex][1] += adjustment * x2;
    bias[classIndex] += adjustment;
}

function makePrediction() {
    const x1 = parseFloat(document.getElementById('test-x1').value);
    const x2 = parseFloat(document.getElementById('test-x2').value);

    // Calculate the score for each class using weights and bias
    let scores = weights.map((w, i) => w[0] * x1 + w[1] * x2 + bias[i]);

    // Find the index of the class with the highest score
    const maxScoreIndex = scores.indexOf(Math.max(...scores));
    const prediction = `Class ${maxScoreIndex}`;

    // Display the prediction
    document.getElementById('prediction').innerText = `Prediction: ${prediction}`;
    console.log(`Predicted class for (${x1}, ${x2}):`, prediction);
}


function drawGraph() {
    const canvas = document.getElementById('graph');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up the main axis lines
    ctx.beginPath();
    ctx.moveTo(250, 0); // Y-axis
    ctx.lineTo(250, 500);
    ctx.moveTo(0, 250); // X-axis
    ctx.lineTo(500, 250);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Adjust font style for tick marks and labels
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw tick marks and labels on X-axis
    for (let x = -5; x <= 5; x++) {
        const xPos = 250 + x * 50;
        
        // Draw tick mark
        ctx.moveTo(xPos, 245);
        ctx.lineTo(xPos, 255);
        ctx.stroke();

        // Draw label, adjusting for positioning outside the graph area
        if (x !== 0) {
            ctx.fillText(x, xPos, 265); // Position label slightly below tick mark
        }
    }

    // Draw tick marks and labels on Y-axis
    ctx.textAlign = 'right';
    for (let y = -5; y <= 5; y++) {
        const yPos = 250 - y * 50;
        
        // Draw tick mark
        ctx.moveTo(245, yPos);
        ctx.lineTo(255, yPos);
        ctx.stroke();

        // Draw label, adjusting for positioning outside the graph area
        if (y !== 0) {
            ctx.fillText(y, 235, yPos); // Position label slightly left of tick mark
        }
    }

    // Draw main axis labels for X and Y, clearly outside the graph area
    ctx.font = '14px Arial';
    ctx.fillText("X", 485, 270); // X label positioned at the far right of the canvas
    ctx.fillText("Y", 260, 15);  // Y label positioned at the top of the canvas

    // Draw data points
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x1 * 50 + 250, point.x2 * 50 + 250, 5, 0, 2 * Math.PI);
        ctx.fillStyle = getColor(point.label);
        ctx.fill();
        ctx.stroke();
    });
}
function drawDecisionBoundary() {
    const canvas = document.getElementById('graph');
    const ctx = canvas.getContext('2d');

    if (numClasses === 2) {
        // Draw a single decision boundary line for binary classification
        const x1 = -5;
        const x2 = 5;
        const y1 = (-weights[0] * x1 - bias) / weights[1];
        const y2 = (-weights[0] * x2 - bias) / weights[1];

        ctx.beginPath();
        ctx.moveTo(x1 * 50 + 250, y1 * 50 + 250);
        ctx.lineTo(x2 * 50 + 250, y2 * 50 + 250);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        // Draw separate boundaries for each class in multi-class classification
        for (let c = 0; c < numClasses; c++) {
            const x1 = -5;
            const x2 = 5;
            const y1 = (-weights[c][0] * x1 - bias[c]) / weights[c][1];
            const y2 = (-weights[c][0] * x2 - bias[c]) / weights[c][1];

            ctx.beginPath();
            ctx.moveTo(x1 * 50 + 250, y1 * 50 + 250);
            ctx.lineTo(x2 * 50 + 250, y2 * 50 + 250);
            ctx.strokeStyle = getColor(c, 0.7);
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
}

function getColor(label, opacity = 1) {
    const colors = [
        `rgba(255, 0, 0, ${opacity})`,
        `rgba(0, 255, 0, ${opacity})`,
        `rgba(0, 0, 255, ${opacity})`,
        `rgba(128, 0, 128, ${opacity})`
    ];
    return colors[label] || `rgba(0, 0, 0, ${opacity})`;
}
