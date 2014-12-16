define(['lib/news_special/bootstrap', 'drinkingAmountForm', 'countryComparison', 'lib/vendors/bind-polyfill.js'], function (news, DrinkingAmountForm, CountryComparison) {

    return {
        init: function () {
            new DrinkingAmountForm();
            new CountryComparison();

            news.$('.main').show();
            news.sendMessageToremoveLoadingImage();

        }
    };

});
