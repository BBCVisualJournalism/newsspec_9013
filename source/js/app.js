define(['lib/news_special/bootstrap', 'drinkingAmountForm'], function (news, DrinkingAmountForm) {

    return {
        init: function () {
            new DrinkingAmountForm();

            news.$('.main').show();
            news.sendMessageToremoveLoadingImage();

        }
    };

});
