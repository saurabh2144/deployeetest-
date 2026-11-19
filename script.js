const btn = document.getElementById('actionBtn');
const output = document.getElementById('output');

let taskCount = 0;

btn.addEventListener('click', () => {
  taskCount++;
  const timestamp = new Date().toLocaleTimeString();
  output.innerText = `[${timestamp}] Production RPA Task #${taskCount} completed successfully!`;
});
