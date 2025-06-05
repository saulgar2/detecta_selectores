document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('createBtn');
  btn.addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value;
    const type = document.getElementById('projectType').value;
    const fileInput = document.getElementById('featureFile');
    let featureText = '';
    let featureName = 'feature.feature';
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      featureName = file.name;
      featureText = await file.text();
    }
    const dirHandle = await window.showDirectoryPicker();
    if (type === 'java-testng') {
      await createJavaTestNgProject(dirHandle, url, featureName, featureText);
    }
    document.getElementById('result').textContent =
      `Proyecto creado en: ${dirHandle.name}`;
  });
});

async function createJavaTestNgProject(dirHandle, url, featureName, featureText) {
  const src = await dirHandle.getDirectoryHandle('src', {create: true});
  const main = await src.getDirectoryHandle('main', {create: true});
  await main.getDirectoryHandle('java', {create: true});
  const test = await src.getDirectoryHandle('test', {create: true});
  const testJava = await test.getDirectoryHandle('java', {create: true});
  const resources = await test.getDirectoryHandle('resources', {create: true});
  const featuresDir = await resources.getDirectoryHandle('features', {create: true});

  const pomText = `<?xml version="1.0"?>\n<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>com.example</groupId>\n  <artifactId>demo</artifactId>\n  <version>1.0-SNAPSHOT</version>\n  <dependencies>\n    <dependency>\n      <groupId>org.testng</groupId>\n      <artifactId>testng</artifactId>\n      <version>7.10.0</version>\n      <scope>test</scope>\n    </dependency>\n    <dependency>\n      <groupId>io.cucumber</groupId>\n      <artifactId>cucumber-java</artifactId>\n      <version>7.18.0</version>\n      <scope>test</scope>\n    </dependency>\n  </dependencies>\n</project>`;
  await writeFile(dirHandle, 'pom.xml', pomText);

  const testText = `import org.testng.annotations.Test;\n\npublic class SampleTest {\n    @Test\n    public void testUrl() {\n        // TODO: implementar pruebas para ${url}\n    }\n}`;
  await writeFile(testJava, 'SampleTest.java', testText);

  if (featureText) {
    await writeFile(featuresDir, featureName, featureText);
    const steps = generateJavaSteps(featureText);
    await writeFile(testJava, 'StepDefinitions.java', steps);
  }
}

function generateJavaSteps(featureText) {
  const lines = featureText.split(/\r?\n/);
  const stepRegex = /^\s*(Given|When|Then|And|But)\s+(.*)/i;
  const steps = [];
  for (const line of lines) {
    const m = line.match(stepRegex);
    if (m) {
      const text = m[2].trim();
      const keyword = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
      if (!steps.some(s => s.text === text)) {
        steps.push({keyword, text});
      }
    }
  }
  let methods = '';
  steps.forEach((step, i) => {
    const escaped = step.text.replace(/"/g, '\\"');
    methods += `    @${step.keyword}("^${escaped}$")\n` +
               `    public void step${i}() {\n` +
               `        // TODO: implementar ${step.text}\n` +
               `    }\n\n`;
  });
  return `import io.cucumber.java.en.*;\n\npublic class StepDefinitions {\n${methods}}`;
}

async function writeFile(dirHandle, name, content) {
  const fileHandle = await dirHandle.getFileHandle(name, {create: true});
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
