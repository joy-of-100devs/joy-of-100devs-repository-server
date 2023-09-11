const href = new URL(document.querySelector("a").href).pathname;
const paragraph = document.createElement("p");
paragraph.innerText = `The root-relative URL of the anchor element is ${href}`

document.body.append(paragraph);
