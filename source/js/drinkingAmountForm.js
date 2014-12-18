define(['lib/news_special/bootstrap', 'lib/news_special/share_tools/controller', 'calculator', 'countryAutocomplete', 'data'], function (news, shareTools, Calculator, CountryAutocomplete, DataModel) {

    'use strict';

    var DrinkingAmountForm = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.drinkingAmountForm');
        this.outputContainer = news.$('.outputContainer');
        this.countryInputEl = this.el.find('.readerCountryInput');
        this.boozeInputs = this.el.find('.boozeInput');
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
            this.countryInput =  new CountryAutocomplete(this.countryInputEl, function (country) {
                news.pubsub.emit('istats', ['user-country', 'newsspec-interaction', country.name]);
            });

            shareTools.init('.shareTools', {
                storyPageUrl: 'http://bbc.in/1uWK4dP',
                header:       'Share this page',
                message:      'Custom message',
                hashtag:      'BBCBoozeNationality?',
                template:     'dropdown' // 'default' or 'dropdown'
            });

            /***************************
                * LISTENERS
            ***************************/
            this.submitButton.on('click', this.showResults.bind(this));
            this.boozeInputs.on('focus', this.selectBoozeInput);
        },

        selectBoozeInput: function () {
            $(this).val('');
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
                closestFittingKey = this.findClosestMatchingCountryKey(readerAnnualTotalsByDrink),
                shareText = null;

            news.$('.shareTools').removeClass('notDisplayed');
            news.$('.navigableCountryHeader').text('Compare your drinking habits with the world:');

            if (closestFittingKey === null) {
                this.showOnGraph('BLR');
                this.printConsumptionData(readerAnnualDrinks);
                news.$('.outputContainer, .heatMapContainer, .graphOutput, .noCloseFitHeadlineResult').removeClass('notDisplayed');
                news.$('.headlineResult, .nonDrinkerHeadlineResult, .basedOnThis').addClass('notDisplayed');
                shareText = 'I drink more than people from Belarus, the heaviest-drinking country. What\'s your';
            } else {
                this.showOnGraph(closestFittingKey);
                news.$('.heatMapContainer, .outputContainer, .graphOutput').removeClass('notDisplayed');
                news.$('.alternativeHeadlineResults').addClass('notDisplayed');
                this.printConsumptionData(readerAnnualDrinks);
                if (closestFittingKey === 'KWT') {
                    news.$('.headlineResult, .outputContainer, .basedOnThis').addClass('notDisplayed');
                    news.$('.nonDrinkerHeadlineResult, .graphOutput').removeClass('notDisplayed');
                    news.$('.navigableCountryHeader').text('Explore the world\'s drinking habits:');
                    shareText = 'I do not drink alcohol, like most people from Kuwait. What\'s your';

                } else {
                    news.$('.headlineResult, .basedOnThis').removeClass('notDisplayed');
                    news.$('.alternativeHeadlineResults').addClass('notDisplayed');

                    var countryText = DataModel[closestFittingKey]['ifNameNeedsAThePrefix'] + DataModel[closestFittingKey]['name'],
                        countryRank = DataModel[closestFittingKey]['overallRank'];

                    news.$('.headlineResult .countryName').text(countryText);
                    news.$('.headlineResult .countryRank').text(countryRank);

                    shareText = 'I drink like I\'m from ' + countryText  + ', the ' + countryRank + '-drinking country. What\'s your';
                    
                }
            }

            // Update share tools message
            var emailMessage = {
                message: shareText + ' booze nationality?',
                subject: 'Booze calculator: What\'s your drinking nationality?'
            };

            var otherMessage = {
                message: shareText + ' #BoozeNationality ?'
            };

            news.pubsub.emit('ns:share:setEmailMessage', emailMessage);
            news.pubsub.emit('ns:share:setFacebookMessage', otherMessage);
            news.pubsub.emit('ns:share:setTwitterMessage', otherMessage.message);

            this.printHomeCountryHealthData(userCountry);

            news.pubsub.emit('country:selected', userCountry);

            var scrollPosition = $('.userOutput').offset().top - 40;
            news.pubsub.emit('window:scroll', [scrollPosition, 400]);

            news.pubsub.emit('istats', ['submit-button-pressed', 'newsspec-interaction', true]);
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

            this.outputContainer.find('.beerText .largeNumber').text(Calculator.formatNumber(pintsPerYear));
            this.outputContainer.find('.wineText .largeNumber').text(Calculator.formatNumber(glassesOfWinePerYear));
            this.outputContainer.find('.spiritsText .largeNumber').text(Calculator.formatNumber(shotsPerYear));

        },

        printHomeCountryHealthData: function (countryData) {

            news.$('.healthAdvice').removeClass('notDisplayed');

            if (countryData['bingeDrinkingMenProportion'] !== null && countryData['bingeDrinkingWomenProportion'] !== null && countryData['abstainersPast12MonthsProportion'] !== null) {
                
                news.$('#heavyDrinkersData .heavyDrinkingMen').text(Calculator.formatNumber(Math.round(countryData['bingeDrinkingMenProportion'])) + '%');
                news.$('.healthAdvice').find('.countryName').text(countryData['ifNameNeedsAThePrefix'] + countryData['name']);
                news.$('#heavyDrinkersData .heavyDrinkingWomen').text(Calculator.formatNumber(Math.round(countryData['bingeDrinkingWomenProportion'])) + '%');
                news.$('#abstainersData .abstentionRate').text(Calculator.formatNumber(Math.round(countryData['abstainersPast12MonthsProportion'])) + '%');

                news.$('.generalHomeCountryData').removeClass('notDisplayed');
            } else {
                news.$('.generalHomeCountryData').addClass('notDisplayed');
            }

        }


    };

    return DrinkingAmountForm;

});