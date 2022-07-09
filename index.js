// Your code here
const apiKey = "8fc66479-c462-4ae5-8a38-56f9d69591bc";

async function getCat() {
    let catData = await fetch("https://api.thecatapi.com/v1/images/search", {
        method: "GET",
        headers: {"x-api-key": apiKey}
    });

    let catArr = await catData.json();
    let cat = catArr[0];
    let catImg = cat.url;

    console.log(catImg);

    return catImg;
}

//let visited = new Set();
//let catData = {};
let currentPageData;

window.onload = event => {
    console.log("loaded!");
    const catsFeed = document.getElementById("catsFeed");
    let catNumber = 0;

    let saved = localStorage.getItem("currentCats");
    if (saved) { currentPageData = JSON.parse(saved); restorePage()}
    else {initializePage()}

    //try { getData() }
    //catch {console.log("no data to load!")}

    async function makeCatImg(catURL) {
        let catImg = catURL || await getCat();
        let newCat = document.createElement("img");
        newCat.setAttribute("class", "cat");
        newCat.setAttribute("src", catImg);

        return newCat;
    }

    async function addCat(catURL, upvotes, commentHTML) {
        let catImg = await makeCatImg(catURL);
        let newCat = document.createElement("div");
        newCat.setAttribute("class", "catDiv");
        newCat.appendChild(catImg);

        let catSrc = getURL(newCat);
        //if (visited.has(catSrc)) {
        //    console.log("repeat cat check!");
        //    upvotes = catData[catSrc].upvotes;
        //    commentHTML = catData[catSrc].comments;
        //}

        let votes = getVoteContainer(upvotes || 0);
        newCat.appendChild(votes);

        let comments = getCommentsContainer(commentHTML || " ");
        newCat.appendChild(comments);

        if (extraCount && extraCount % 2 !== 0) {
            comments.classList.add("hide");
            votes.classList.add("hide");
            newCat.classList.add("expand");
        }

        catsFeed.appendChild(newCat);
        //saveData(catSrc, newCat);
        catNumber++;

        saveCurrentPage();
    }

    function getVoteButtons(votes, num) {
        let container = document.createElement("div");
        container.setAttribute("class", "buttons");

        let upvote = document.createElement("button");
        upvote.setAttribute("class", "upvote");
        upvote.setAttribute("type", "button");
        upvote.innerText = "Upvote";
        container.appendChild(upvote);

        let downvote = document.createElement("button");
        downvote.setAttribute("class", "downvote");
        downvote.setAttribute("type", "button");
        downvote.innerText = "Downvote";
        container.appendChild(downvote);

        addVoteListeners(upvote, downvote, votes, num);

        return container;
    }

    function getVoteContainer(upvotes) {
        let voteContainer = document.createElement("div");
        voteContainer.setAttribute("class", "voteContainer");

        let num = upvotes;

        let votes = document.createElement("p");
        votes.setAttribute("class", "voteCount");
        votes.innerText = `Popularity: ${num}`
        voteContainer.appendChild(votes);

        voteContainer.appendChild(getVoteButtons(votes, num));
        return voteContainer;
    }

    function addVoteListeners(upvote, downvote, votes, num) {
        upvote.addEventListener("click", event => {
            num++;
            votes.innerText = `Popularity: ${num}`;
            saveCurrentPage();
        });

        downvote.addEventListener("click", event => {
            num--;
            votes.innerText = `Popularity: ${num}`;
            saveCurrentPage();
        });
    };

    function getCommentField() {
        let comment = document.createElement("form");
        comment.setAttribute("class", "commentForm");

        let label = document.createElement("label");
        label.setAttribute("for", "comment");
        label.setAttribute("class", "label");
        label.innerText = "Comment:";
        comment.appendChild(label);

        let field = document.createElement("textarea");
        field.setAttribute("class", "commentField");
        comment.appendChild(field);

        let submit = document.createElement("button");
        submit.setAttribute("type", "button");
        submit.setAttribute("class", "submit");
        submit.innerText = "Submit";
        comment.appendChild(submit);

        return [comment, submit, field];
    }

    function getCommentsContainer(commentHTML) {
        let container = document.createElement("div");
        container.setAttribute("class", "commentContainer");

        let [commentField, submit, field] = getCommentField();
        container.appendChild(commentField);

        let posted = document.createElement("ul");
        posted.setAttribute("class", "posted");
        if (commentHTML.length > 0) {
            posted.innerHTML = commentHTML;
        }
        container.appendChild(posted);

        submit.addEventListener("click", event => {
            let newComment = field.value;

            if (newComment.length > 0) {
                posted.insertAdjacentHTML("afterbegin", `<li class="comment">${newComment} - <span class="inner">at ${new Date()}</span></li>`);
                saveCurrentPage();
            }
        })

        return container;
    }

    function initializePage() {
        for (let i = 0; i < 10; i++) { addCat() }
    }

    let loadMore = document.getElementById("load");
    loadMore.addEventListener("click", event => {
        for (let i = 0; i < 10; i++) { addCat() }

        setTimeout(unloadCats, 5000);
    });

    function unloadCats() {
        if (catNumber <= 20) {return}

        let cats = catsFeed.children;
        let subtract = catNumber - 20;

        console.log("subtract", subtract);
        console.log("catNumber", catNumber)

        try {
            for (let i = 0; i < subtract; i++) { cats[i].remove(); catNumber-- }
        } catch {console.log(`unload stopped!`)}

        saveCurrentPage();
        //sendData();
        //getData();
    }

    //function saveData(catURL, cat) {
    //    let currentCat = cat || findCat(catURL);

    //    catData[catURL] = {
    //        comments: getComments(currentCat),
    //        upvotes: getUpvotes(currentCat)
    //    };

        //localStorage.setItem("catData", JSON.stringify(catData));
    //}

    function saveCurrentPage() {
        currentPageData = {};
        let cats = catsFeed.children;

        for (let i = 0; i < cats.length; i++) {
            let cat = cats[i];

            currentPageData[getURL(cat)] = {
                upvotes: getUpvotes(cat),
                comments: getComments(cat)
            }

            //saveData(getURL(cat), cat);
        }

        localStorage.setItem("currentCats", JSON.stringify(currentPageData));
    }

    function restorePage() {
        for (let cats in currentPageData) {
            let cat = currentPageData[cats];
            let upvotes = cat.upvotes;
            let comments = cat.comments;

            addCat(cats, upvotes, comments);
        }
    }

    function findCat(catURL) {
        let cats = catsFeed.children;

        for (let i = 0; i < cats.length; i++) {
            let url = getURL(cats[i]);
            if (url === catURL) { return cats[i] }
        }
    }

    function getURL(cat) {
        return cat.children[0].src;
    }

    function getUpvotes(cat) {
        return cat.children[1].children[0].innerText.split(": ")[1];
    }

    function getComments(cat) {
        return cat.children[2].children[1].innerHTML;
    }

    /*async function sendData() {
        let send = await fetch("/catData", {
            method: "POST",
            body: JSON.stringify(catData)
        });
    }

    async function getData() {
        let data = await (await fetch("/catData")).json();
        if (data) {
            catData = data;
            for (let keys in catData) {
                visited.add(keys);
            }
        }
    } */

    let extraCount = 0;
    const extrasButton = document.getElementById("toggle");
    extrasButton.addEventListener("click", event => {
        let comments = document.querySelectorAll(".commentContainer");
        let upvotes = document.querySelectorAll(".voteContainer");
        let cats = document.querySelectorAll(".catDiv");

        comments.forEach(comment => {
            comment.classList.toggle("hide");
        });

        upvotes.forEach(vote => {
            vote.classList.toggle("hide");
        });

        cats.forEach(cat => {
            cat.classList.toggle("expand");
        });

        extraCount++;
        if (extraCount % 2 === 0) { extrasButton.innerText = "Hide Extras" }
        else { extrasButton.innerText = "Show Extras" }
    });

}
