define(['lib/news_special/bootstrap', 'data'], function (news, data) {

    return {
        init: function () {
            console.log(data);
            news.sendMessageToremoveLoadingImage();
        }
    };

});
