document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('createBtn');
  btn.addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value;
    const type = document.getElementById('projectType').value;
    const dirHandle = await window.showDirectoryPicker();
    if (type === 'java-testng') {
      await createJavaTestNgProject(dirHandle, url);
    }
    document.getElementById('result').textContent =
      `Proyecto creado en: ${dirHandle.name}`;
  });
});

async function createJavaTestNgProject(dirHandle, url) {
  const src = await dirHandle.getDirectoryHandle('src', {create: true});
  const main = await src.getDirectoryHandle('main', {create: true});
  await main.getDirectoryHandle('java', {create: true});
  const test = await src.getDirectoryHandle('test', {create: true});
  const testJava = await test.getDirectoryHandle('java', {create: true});
  const resources = await test.getDirectoryHandle('resources', {create: true});
  await resources.getDirectoryHandle('features', {create: true});

  const pomText = `<?xml version="1.0"?>\n<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>com.example</groupId>\n  <artifactId>demo</artifactId>\n  <version>1.0-SNAPSHOT</version>\n  <dependencies>\n    <dependency>\n      <groupId>org.testng</groupId>\n      <artifactId>testng</artifactId>\n      <version>7.10.0</version>\n      <scope>test</scope>\n    </dependency>\n    <dependency>\n      <groupId>io.cucumber</groupId>\n      <artifactId>cucumber-java</artifactId>\n      <version>7.18.0</version>\n      <scope>test</scope>\n    </dependency>\n  </dependencies>\n</project>`;
  await writeFile(dirHandle, 'pom.xml', pomText);

  const testText = `import org.testng.annotations.Test;\n\npublic class SampleTest {\n    @Test\n    public void testUrl() {\n        // TODO: implementar pruebas para ${url}\n    }\n}`;
  await writeFile(testJava, 'SampleTest.java', testText);
}

async function writeFile(dirHandle, name, content) {
  const fileHandle = await dirHandle.getFileHandle(name, {create: true});
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
