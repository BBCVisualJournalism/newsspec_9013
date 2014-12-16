define(['lib/news_special/bootstrap', 'lib/news_special/share_tools/controller', 'calculator', 'countryAutocomplete', 'data'], function (news, shareTools, Calculator, CountryAutocomplete, DataModel) {

    'use strict';

    var DrinkingAmountForm = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.drinkingAmountForm');
        this.outputContainer = news.$('.outputContainer');
        this.countryInputEl = this.el.find('.readerCountryInput');
        this.submitButton = this.el.find('.submitButton');
        this.calculator = new Calculator();

        this.countryInput = null;

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    DrinkingAmountForm.prototype = {

        init: function () {
            this.countryInput =  new CountryAutocomplete(this.countryInputEl);

            shareTools.init('.shareTools', {
                storyPageUrl: document.referrer,
                header:       'Share this page',
                message:      'Custom message',
                hashtag:      'BBCNewsGraphics',
                template:     'dropdown' // 'default' or 'dropdown'
            });

            /***************************
                * LISTENERS
            ***************************/
            this.submitButton.on('click', this.showResults.bind(this));
        },

        showResults: function () {
            var readerAnswers = this.calculator.getUserInput(),
                userCountry = this.countryInput.getSelectedCountry();

            if (readerAnswers === false || userCountry === false) {
                return;
            }

            var readerAnnualDrinks = this.calculator.calcAnnualNumberOfDrinks(readerAnswers),
                readerAnnualTotalsByDrink = this.calculator.calcReaderAnnualTotalsByDrink(readerAnswers),
                countryData = DataModel[userCountry.countryCode]['drinksData'],
                closestFittingKey = this.findClosestMatchingCountryKey(readerAnnualTotalsByDrink);

            if (closestFittingKey === null) {
                this.showOnGraph('BLR');
                this.printConsumptionData(readerAnnualDrinks);
                news.$('.outputContainer, .heatMapContainer, .graphOutput, .noCloseFitHeadlineResult').removeClass('notDisplayed');
                news.$('.headlineResult, .nonDrinkerHeadlineResult, shareTools, .basedOnThis').addClass('notDisplayed');
            } else {
                this.showOnGraph(closestFittingKey);
                news.$('shareTools, .heatMapContainer, .outputContainer, .graphOutput').removeClass('notDisplayed');
                news.$('.alternativeHeadlineResults').addClass('notDisplayed');
                this.printConsumptionData(readerAnnualDrinks);
                if (closestFittingKey === 'KWT') {
                    news.$('.headlineResult, .outputContainer, .basedOnThis').addClass('notDisplayed');
                    news.$('.nonDrinkerHeadlineResult, .graphOutput').removeClass('notDisplayed');
                    news.$('.heatMapHeadline').text('Explore the world\'s drinking habits:');
                } else {
                    news.$('.headlineResult, .basedOnThis').removeClass('notDisplayed');
                    news.$('.alternativeHeadlineResults').addClass('notDisplayed');
                    news.$('.headlineResult .countryName').text(DataModel[closestFittingKey]['ifNameNeedsAThePrefix'] + DataModel[closestFittingKey]['name']);
                    news.$('.headlineResult .countryRank').text(DataModel[closestFittingKey]['overallRank']);
                }
            }

            this.printHomeCountryHealthData(userCountry);

            news.pubsub.emit('country:selected', userCountry);
        },


        findClosestMatchingCountryKey: function (readerAnnualTotalsByDrink) {

            var DIFFERENCE_THRESHOLD = 15;

            var lowestDifference = Number.POSITIVE_INFINITY;
            var closestFittingKey = '';
            for (var key in DataModel) {
                var drinksData = DataModel[key]['drinksData'];

                var difference = 0;
                difference += (Math.pow(readerAnnualTotalsByDrink.beers - drinksData[0], 2));
                difference += (Math.pow(readerAnnualTotalsByDrink.wines - drinksData[1], 2));
                difference += (Math.pow(readerAnnualTotalsByDrink.spirits - drinksData[2], 2));
                difference = Math.sqrt(difference);

                if (difference < lowestDifference) {
                    lowestDifference = difference;
                    closestFittingKey = key;
                }
            }

            if (lowestDifference < DIFFERENCE_THRESHOLD) {
                return closestFittingKey;
            } else {
                return null;
            }
        },

        showOnGraph: function (countryID) {

            news.$('.divToDisplay').removeClass('divToDisplay');

            news.$('.alcoholGraph #bar-' + countryID + ' .bar').addClass('divToDisplay');

            news.$('.alcoholGraph #bar-' + countryID + ' .caption').html('<p class="smallerText">' + DataModel[countryID]['name'] + '</p>');

            news.$('.alcoholGraph #bar-' + countryID + ' .caption').addClass('divToDisplay');

            if (parseInt(DataModel[countryID]['overallConsumptionMen'], 10) < 10) {
                news.$('.alcoholGraph').addClass('invert');
            } else {
                news.$('.alcoholGraph').removeClass('invert');
            }

        },

        printConsumptionData: function (annualNumberOfDrinks) {

            var pintsPerYear = annualNumberOfDrinks.beers,
                glassesOfWinePerYear = annualNumberOfDrinks.wines,
                shotsPerYear = annualNumberOfDrinks.spirits;

            this.outputContainer.find('.beerText .largeNumber').text(pintsPerYear);
            this.outputContainer.find('.wineText .largeNumber').text(glassesOfWinePerYear);
            this.outputContainer.find('.spiritsText .largeNumber').text(shotsPerYear);

        },

        printHomeCountryHealthData: function (countryData) {

            news.$('.healthAdvice').removeClass('notDisplayed');

            if (countryData['bingeDrinkingMenProportion'] !== null && countryData['bingeDrinkingWomenProportion'] !== null && countryData['abstainersPast12MonthsProportion'] !== null) {
                
                news.$('#heavyDrinkersData .heavyDrinkingMen').text(Math.round(countryData['bingeDrinkingMenProportion']) + '%');
                news.$('.healthAdvice').find('.countryName').text(countryData['ifNameNeedsAThePrefix'] + countryData['name']);
                news.$('#heavyDrinkersData .heavyDrinkingWomen').text(Math.round(countryData['bingeDrinkingWomenProportion']) + '%');
                news.$('#abstainersData .abstentionRate').text(Math.round(countryData['abstainersPast12MonthsProportion']) + '%');

                news.$('.generalHomeCountryData').removeClass('notDisplayed');
            } else {
                news.$('.generalHomeCountryData').addClass('notDisplayed');
            }

        }


    };

    return DrinkingAmountForm;

});