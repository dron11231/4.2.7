const input = document.querySelector(".search-input");
const resultList = document.querySelector(".repositories-list");
const resultListItems = document.querySelectorAll(".repositories-list__item");
const addedRepositoriesList = document.querySelector(".added-repositories");
const appWindow = document.querySelector(".app-window");

const debounce = (fn, dbTime) => {
  let timerId;
  return () => {
    const fnCall = () => {
      fn();
    };
    clearTimeout(timerId);
    timerId = setTimeout(fnCall, dbTime);
  };
};

const debounceResponse = debounce(getResponse, 500);

input.addEventListener("input", debounceResponse);

const addRepository = async (e) => {
  const addedRepository = document.createElement("li");
  const repositoryInfo = document.createElement("div");
  const repositoryName = document.createElement("span");
  const repositoryOwner = document.createElement("span");
  const repositoryStars = document.createElement("span");
  const removeBtn = document.createElement("button");
  const crossImg = document.createElement("img");
  crossImg.src = "images/cross.svg";

  addedRepository.classList.add("added-repositories__item");
  repositoryInfo.classList.add("added-repositories__data");
  repositoryName.classList.add("added-repositories__text");
  repositoryOwner.classList.add("added-repositories__text");
  repositoryStars.classList.add("added-repositories__text");
  removeBtn.classList.add("remove-btn");
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${input.value}`
    );
    const jsonResponse = await response.json();
    const repositories = jsonResponse.items;
    const selectedName = e.target.textContent;

    repositories.forEach((repos) => {
      if (selectedName === repos.name) {
        repositoryName.innerHTML = `Name: ${repos.name}`;
        repositoryOwner.innerHTML = `Owner: ${repos.owner.login}`;
        repositoryStars.innerHTML = `Stars: ${repos.stargazers_count}`;

        repositoryInfo.append(repositoryName, repositoryOwner, repositoryStars);
        removeBtn.append(crossImg);
        addedRepository.append(repositoryInfo, removeBtn);
        addedRepository.append(removeBtn);
        addedRepositoriesList.append(addedRepository);

        removeBtn.addEventListener("click", function remover() {
          addedRepository.remove();
          removeBtn.removeEventListener("click", remover);
        });
      }
    });
    input.value = "";
    resultListItems.forEach((el) => {
      el.style.display = "none";
    });
  } catch (err) {
    alert("Достигнут лимит запросов на сервер");
  }
};

async function getResponse() {
  if (input.value !== "") {
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${input.value}`
      );
      const jsonResponse = await response.json();
      if (response.status === 403) {
        console.log(jsonResponse);
      }
      const repositories = jsonResponse.items;
      const names = [];
      const inputValue = input.value;
      const foundNames = [];

      repositories.forEach((repos) => {
        names.push(repos.name);
      });
      if (inputValue !== "") {
        const regExp = new RegExp(inputValue, "i");

        names.forEach((name) => {
          if (name.match(regExp)) {
            foundNames.push(name);
          }
        });
      }
      resultListItems.forEach((el, idx) => {
        el.innerHTML = foundNames[idx];
        if (el.textContent !== "" && el.textContent !== "undefined") {
          el.style.display = "block";
        } else {
          el.style.display = "none";
        }
      });
      resultList.addEventListener("click", function addHandler(e) {
        addRepository(e);
        resultList.removeEventListener("click", addHandler);
      });
    } catch (err) {
      alert("Достигнут лимит запросов на сервер");
    }
  } else {
    resultListItems.forEach((el) => {
      el.style.display = "none";
    });
  }
}
