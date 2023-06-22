const page = document.querySelector("div.paper.primary");
const pageBG = document.querySelector("div.paper.bg");
const form = document.querySelector("div#form");
const pagesEl = document.querySelector("div#pages");

const range = (n) => new Array(n).fill(".").map((_, i) => i);

document.querySelectorAll("button.next").forEach((btn) => {
	btn.addEventListener("click", flip);
});

document.querySelectorAll("input[type=number]").forEach((input) => {
	const createButton = (text, offset) => {
		const element = document.createElement("span");
		element.classList.add("number");
		element.innerText = text;

		element.addEventListener("click", () => {
			if (input.disabled) return;
			input.value = Math.min(
				Math.max(parseInt(input.value) + offset, 0),
				input.getAttribute("max") ?? 99
			);
		});

		return element;
	};

	input.insertAdjacentElement("beforebegin", createButton("-", -1));
	input.insertAdjacentElement("afterend", createButton("+", 1));

	input.addEventListener("change", () => {
		input.value = Math.min(
			Math.max(parseInt(input.value), 0),
			input.getAttribute("max") ?? 99
		);
	});

	if (input.dataset.disabler) {
		const target = document.getElementById(input.dataset.disabler);
		if (target != null) {
			target.addEventListener("click", () => {
				input.disabled = !target.checked;
			});
		}
	}
});

document.querySelectorAll("input[type=checkbox]").forEach((input) => {
	if (input.dataset.disabler) {
		const target = document.getElementById(input.dataset.disabler);
		if (target != null) {
			target.addEventListener("click", () => {
				input.disabled = !target.checked;
			});
		}
	}
});

function flip() {
	const nextPanel = form.querySelector("div.selected").nextElementSibling;
	if (nextPanel.dataset.page === "@print") {
		page.classList.add("hide");
		pageBG.classList.add("hide");
		page.querySelector("img").style.opacity = 0;
		form.querySelector("div.selected").style.opacity = 0;

		setTimeout(() => {
			form.querySelector("div.selected").classList.remove("selected");
			nextPanel.classList.add("selected");
			printBooklet();
		}, 200);
		return;
	}

	page.classList.add("flip");
	pageBG.classList.add("flip");
	page.querySelector("img").style.opacity = 0;
	form.querySelector("div.selected").style.opacity = 0;

	setTimeout(() => {
		pageBG.classList.add("open");
		page.classList.remove("flip");
		pageBG.classList.remove("flip");

		form.querySelector("div.selected").classList.remove("selected");
		nextPanel.classList.add("selected");

		const img = page.querySelector("img");
		img.src = nextPanel.dataset.page + ".png";
		img.addEventListener(
			"load",
			() => {
				img.style.opacity = 1;
			},
			{ once: true }
		);
	}, 200);
}

function printBooklet() {
	//	Compile booklet

	let pages = ["pages/page-01"];
	const addPage = (id) => {
		if (
			document.querySelector(`input[type=checkbox][id='${id}-enabled']`)
				?.checked
		) {
			pages.push(document.getElementById(id).dataset.page);
		}
	};
	const addQtyPage = (id) => {
		let quantity = parseInt(
			document.querySelector(`input[type=number][id='${id}-quantity']`)?.value
		);
		let altPage = !(
			document.querySelector(`input[type=checkbox][id='${id}-alt']`)?.checked ??
			true
		);

		if (
			document.querySelector(`input[type=checkbox][id='${id}-enabled']`)
				?.checked &&
			quantity > 0
		) {
			pages.push(
				document.getElementById(id)?.dataset.page + (altPage ? "c" : "")
			);

			for (let i = 0; i < quantity - 1; i++) {
				pages.push(
					document.getElementById(id)?.dataset.page + (altPage ? "d" : "b")
				);
			}
		}
	};

	addPage("01");
	addPage("02");
	addQtyPage("03");
	addQtyPage("04");
	addQtyPage("05");
	addQtyPage("06");

	if (
		document.querySelector(`input[type=checkbox][id='07-enabled']`)?.checked
	) {
		let spellLevels = parseInt(
			document.querySelector(`input[type=number][id='07-levels']`)?.value
		);

		pages.push("pages/page-08.0");
		if (spellLevels >= 1) pages.push("pages/page-08.1");
		if (spellLevels >= 2) pages.push("pages/page-08.2");
		if (spellLevels >= 3) pages.push("pages/page-08.3");
		if (spellLevels >= 4) pages.push("pages/page-08.4");
		if (spellLevels >= 6) pages.push("pages/page-08.5");
		if (spellLevels >= 8) pages.push("pages/page-08.6");
	}

	let remainder = (pages.length + 1) % 4;
	if (remainder !== 0) for (i in range(4 - remainder)) pages.push("@empty");
	pages.push("pages/page-10");

	//	Create print images
	const addImage = (path) => {
		const el = document.createElement("span");
		if (path !== "@empty") el.style.backgroundImage = `url('${path}.png')`;
		pagesEl.append(el);
	};

	while (pages.length > 0) {
		addImage(pages.pop());
		addImage(pages.shift());
		addImage(pages.shift());
		addImage(pages.pop());
	}

	print();
}

window.addEventListener("scroll", () => window.scroll(0, 0));
window.addEventListener("afterprint", () => location.reload());
