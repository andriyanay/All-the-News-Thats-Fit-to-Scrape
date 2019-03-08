$(".btn-group").on("click", "button", function () {
    var link = $(this).data("link");

    window.location.replace(link);
})

$("#scrape").click(function () {
    $.get("/scrape", function (data) {
        console.log(data);
        
    })
    window.location.replace("/articles");
})

$(".articleRow").on("click", ".favorite", function () {
    var id = $(this).data("id");
    var click = {
        click: $(this).attr("data-click")
    }
    var toggle = $(this).attr("data-click")
    $.post(`/favorite/${id}`, click, function (data) {
        console.log(data);
    })

    if (toggle === "false") {
        $(this).addClass("btn-danger");
        $(this).removeClass("btn-default");
        $(this).text("Favorited");
        $(this).attr("data-click", "true");
    } else {
        $(this).removeClass("btn-danger");
        $(this).addClass("btn-default");
        $(this).text("Favorite");
        $(this).attr("data-click", "false");
    }
})

$(".col-sm-1").on("click", ".saved", function () {
    var id = $(this).data("id");
    var click = {
        click: $(this).attr("data-click")
    }
    $.post(`/favorite/${id}`, click, function (data) {
        console.log(data);
    })

    location.reload()
})

$(".col-sm-1").on("click", ".note", function () {
    $("#noteTitle").val("");
    $("#noteBody").val("");
    var id = $(this).data("id");
    $.get(`/articles/${id}`, function (data) {
        if (data.note) {
            $("#noteTitle").val(data.note.title);
            $("#noteBody").val(data.note.body);
        }

    })

    $("#articleId").attr("data-id", id);
})

$(".modal-footer").on("click", ".saveNote", function () {
    var id = $("#articleId").data("id");
    var note = {
        title: $("#noteTitle").val().trim(),
        body: $("#noteBody").val().trim()
    }

    $.post(`/articles/${id}`, note, function (data) {
        console.log(data);
    })
})