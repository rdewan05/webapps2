const mainComment = document.getElementById("main-comment");
const commentList = document.getElementById("list");

let addComment = () => {
    if (!localStorage.getItem("comments")) {
        let comments = [];
        localStorage.setItem("comments", JSON.stringify(comments));
    }

    if (mainComment.value != "") {
        comments = JSON.parse(localStorage.getItem("comments"));
        comments.push({
            parentCommentId: null,
            commentId: Math.random().toString().substr(2, 7),
            commentText: mainComment.value,
            childComments: [],
            Likes: 0
        });

        localStorage.setItem("comments", JSON.stringify(comments));
        displayAllComments();
        mainComment.value = "";
    }
}

let displayAllComments = () => {
    let getCommentsFromLS = JSON.parse(localStorage.getItem("comments"));
    if (getCommentsFromLS) {
        let allComments = createRecursiveView(getCommentsFromLS);
        commentList.innerHTML = allComments;
    }
}


let createRecursiveView = (commentList, padding = 0) => {
    let fullView = "";
    for (let i of commentList) {
        fullView += singleCommentCard(i, padding);
        if (i.childComments.length > 0) {
            fullView += createRecursiveView(i.childComments, (padding += 20));
            padding -= 20;
        }
    }
    return fullView;
};

let singleCommentCard = (obj, padding) => `
<div style="margin-left:${padding}px; border: 2px solid green; width: 400px; border-radius: 10px; data-parentId="${obj.parentCommentId}" id="${obj.commentId}""> 
${obj.commentText}

<a href="#">Likes</a><span style="color: red">${obj.Likes === 0 ? "" : obj.Likes} </span>
<a href="#">Reply</a><span style="color: red">${obj.childComments.length === 0 ? "" : obj.childComments.length} </span>
<a href="#"> Edit</a>
<a href="#"> Delete </a>
</div>`

let getAllComments = () => JSON.parse(localStorage.getItem("comments"));
let setAllComments = (allComments) => localStorage.setItem("comments", JSON.stringify(allComments));

let deleteComment = (commentList, id) => {
    for (let i in commentList) {
        if (commentList[i].commentId == id) {
            commentList.splice(i, 1);
        } else if (commentList[i].childComments.length > 0) {
            deleteComment(commentList[i].childComments, id);
        }
    }
}

let createReplyButtonView = (parentId, operation, commentOld) => {
    let div = document.createElement("div");
    div.setAttribute("data-parentId", parentId);
    div.innerHTML = `<input type="text" value="${operation === "Update Comment" ? commentOld : ""}"> <a href="#">${operation}</a>`;
    return div;
}

let addNewComments = (commentList, newComment) => {
    for (let i of commentList) {
        if (i.commentId === newComment.parentCommentId) {
            i.childComments.push(newComment);
        } else if (i.childComments.length > 0) {
            addNewComments(i.childComments, newComment);
        }
    }
}

let updateComments = (commentList, id, updatedValue) => {
    for (let i of commentList) {
        if (i.commentId === id) {
            i.commentText = updatedValue;
        } else if (i.childComments.length > 0) {
            updateComments(i.childComments, id, updatedValue);
        }
    }
}

commentList.addEventListener('click', (e) => {
    if (e.target.innerText == "Delete") {
        const parentId = e.target.parentNode.getAttribute("id");
        let getCommentsFromLS = getAllComments();
        deleteComment(getCommentsFromLS, parentId);
        setAllComments(getCommentsFromLS);
        displayAllComments();
    }

    if (e.target.innerText === "Reply") {
        const parentId = e.target.parentNode.getAttribute("data-parentId")
            ? e.target.parentNode.getAttribute("data-parentId")
            : e.target.parentNode.getAttribute("id");
        let currentParentComment = e.target.parentNode;
        currentParentComment.appendChild(createReplyButtonView(parentId, "Add Comment"));
    }

    if (e.target.innerText === "Add Comment") {
        const parentId = e.target.parentNode.getAttribute("data-parentId")
            ? e.target.parentNode.getAttribute("data-parentId")
            : e.target.parentNode.getAttribute("id");
        const newComment = {
            parentCommentId: parentId,
            commentId: Math.random()
                .toString()
                .substr(2, 7),
            commentText: e.target.parentNode.firstChild.value,
            childComments: [],
            Likes: 0
        }

        let getCommentsFromLS = getAllComments();
        addNewComments(getCommentsFromLS, newComment);
        setAllComments(getCommentsFromLS);
        displayAllComments();
    }

    if (e.target.innerText === "Edit") {
        const parentId = e.target.parentNode.getAttribute("data-parentId")
            ? e.target.parentNode.getAttribute("data-parentId")
            : e.target.parentNode.getAttribute("id");
        let currentParentComment = e.target.parentNode;
        let commentsContent = currentParentComment.innerText;
        let commentsArray = commentsContent.split(" ");
        let findIndexOfLikes = commentsArray.indexOf("Likes");
        let realComment = commentsArray.slice(0, findIndexOfLikes);

        currentParentComment.appendChild(createReplyButtonView(parentId, "Update Comment", realComment.join(" ")));
        e.target.style.display = "none";

    }

    if (e.target.innerText === "Update Comment") {
        const parentId = e.target.parentNode.getAttribute("data-parentId")
            ? e.target.parentNode.getAttribute("data-parentId")
            : e.target.parentNode.getAttribute("id");

        let getCommentsFromLS = getAllComments();
        updateComments(getCommentsFromLS, parentId, e.target.parentNode.firstChild.value);
        setAllComments(getCommentsFromLS);
        displayAllComments();
    }
})
