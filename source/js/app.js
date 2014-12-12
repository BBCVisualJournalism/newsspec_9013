define(['lib/news_special/bootstrap', 'lib/news_special/share_tools/controller'], function (news, shareTools) {

    return {
        init: function () {

            news.pubsub.emit('istats', ['app-initiated', 'newsspec-nonuser', true]);
            
            // setTimeout(function () {
            //     news.pubsub.emit('istats', ['panel-clicked', 'newsspec-interaction', 3]);
            // }, 500);
            // setTimeout(function () {
            //     news.pubsub.emit('istats', ['quiz-end', 'newsspec-interaction', true]);
            // }, 2000);

            shareTools.init('.tempShareToolsHolder', {
                storyPageUrl: 'http://bbc.co.uk/',
                header:       'Share this page',
                message:      'Custom message',
                hashtag:      'BBCNewsGraphics',
                template:     'dropdown'
            });
            //shareTools template key value can be 'default' or 'dropdown'

            // news.setStaticIframeHeight(2000);

            // news.hostPageSetup(function () {
            //     window.alert('sending instructions to the host page');
            //     document.body.style.background = 'red';
            // });

            news.sendMessageToremoveLoadingImage();
        }
    };

});
