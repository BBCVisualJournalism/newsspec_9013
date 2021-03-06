(function () {

    var IframeWatcher = function (linkId) {
        if (this.istatsCanBeUsed()) {
            this.addIstatsDependency(linkId);
        }
        else {
            this.createIframe(linkId);
        }
        this.updateSizeWhenWindowResizes();
    };

    IframeWatcher.prototype = {
        istatsCanBeUsed: function () {
            return ('require' in window) && this.onBbcDomain();
        },
        addIstatsDependency: function (linkId) {
            var iframeWatcher = this;
            require(['istats-1'], function (istats) {
                iframeWatcher.istats = istats;
                iframeWatcher.createIframe(linkId);
            });
        },
        updateSizeWhenWindowResizes: function () {
            var iframeWatcher = this;

            this.onEvent(window, 'resize', function () {
                iframeWatcher.setDimensions();
            });
        },
        onEvent: function (domElement, eventName, callback, useCapture) {
            if (useCapture === undefined) {
                useCapture = false;
            }

            if (domElement.addEventListener) {
                domElement.addEventListener(eventName, callback, useCapture);
            } else {
                domElement.attachEvent('on' + eventName, callback);
            }
        },
        data: {},
        istatsQueue: [],
        updateFrequency: 32,
        createIframe: function (linkId) {

            var link          = document.getElementById(linkId),
                href          = link.href,
                token         = link.parentNode.className,
                iframeWatcher = this,
                hostId        = this.getWindowLocationOrigin(),
                urlParams     = window.location.hash || '',
                hostUrl       = window.location.href.replace(urlParams, ''),
                onBBC         = this.onBbcDomain();
            
            this.staticHeight = link.getAttribute('data-static-iframe-height');
            this.addLoadingSpinner(link, linkId);

            if (this.hostIsNewsApp(token)) {
                hostId = token;
            }

            this.elm = document.createElement('iframe');
            this.elm.className = 'responsive-iframe';
            this.elm.style.width = '100%';
            this.elm.scrolling = 'no';
            this.elm.allowfullscreen = true;
            this.elm.frameBorder = '0';

            this.decideHowToTalkToIframe(href);

            this.elm.src = href + '&hostid=' + hostId.split('//')[1] + '&hostUrl=' + hostUrl + '&iframeUID=' + linkId + '&onbbcdomain=' + onBBC + urlParams;

            link.parentNode.appendChild(this.elm);
            link.parentNode.removeChild(link);

            this.lastRecordedHeight = this.elm.height;
            this.iframeInstructionsRan = false;

            this.handleIframeLoad(function startIframing() {
                iframeWatcher.getAnyInstructionsFromIframe();
                iframeWatcher.setDimensions();
            });

            this.removeAppWebViewLinksFromHostPage();
            this.removeFallbackImageFromHostPage();
        },
        addLoadingSpinner: function (link, iframeUID) {
            var spinner = document.createElement('IMG'),
                size    = '33',
                spinnerHolder;

            spinner.id  = 'bbc-news-visual-journalism-loading-spinner__img';
            spinner.src = 'data:image/gif;base64,R0lGODlhIQAhALMAAMPDw/Dw8BAQECAgIICAgHBwcKCgoDAwMFBQULCwsGBgYEBAQODg4JCQkAAAAP///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFFOTcwNTgzMDlCMjExRTQ4MDU3RThBRkIxMjYyOEYyIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFFOTcwNTg0MDlCMjExRTQ4MDU3RThBRkIxMjYyOEYyIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUU5NzA1ODEwOUIyMTFFNDgwNTdFOEFGQjEyNjI4RjIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUU5NzA1ODIwOUIyMTFFNDgwNTdFOEFGQjEyNjI4RjIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAIQAhAAAE0vDJSScguOrNE3IgyI0bMIQoqUoF6q5jcLigsCzwJrtCAeSjDwoRAI4aLoNxxBCglEtJoFGUKFCEqCRxKkidoIP20aoVDaifFvB8XEGDseQEUjzoDq+87IijEnIPCSlpgWwhDIVyhyKKY4wOD3+BgyF3IXpjfHFvfYF4dmghalGQSgFgDmJaM2ZWWFEEKHYSTW1AojUMFEi3K7kgDRpCIUQkAcQgCDqtIT2kFgWpYVUaOzQ2NwvTIQfVHHw04iCZKibjNAPQMB7oDgiAixjzBOsbEQA7';
            spinner.width          = size;
            spinner.height         = size;
            spinner.style.maxWidth = size + 'px';

            spinnerHolder                       = document.createElement('div');
            spinnerHolder.align                 = 'center';
            spinnerHolder.id                    = iframeUID + '--bbc-news-visual-journalism-loading-spinner';
            spinner.className                   = 'bbc-news-visual-journalism-loading-spinner';
            spinnerHolder.innerHTML             = '<div id="bbc-news-visual-journalism-loading-spinner__text"></div>';
            spinnerHolder.style.backgroundColor = '#fff';
            spinnerHolder.appendChild(spinner);
        
            link.parentNode.appendChild(spinnerHolder);
        },
        handleIframeLoad: function (startIframing) {
            // IMPORTANT: Had to make this an onload because the 
            // polyfilling and jquery on one page causes issues
            this.onEvent(window, 'load', function () {
                startIframing();
            }, true);

            if (this.elm.onload) {
                this.elm.onload = startIframing;
            }
            // Bug in IE7 means onload doesn't fire when an iframe 
            // loads, but the event will fire if you attach it correctly
            else if ('attachEvent' in this.elm) {
                this.elm.attachEvent('onload', startIframing);
            }
        },
        decideHowToTalkToIframe: function (href) {
            if (window.postMessage) { // if window.postMessage is supported, then support for JSON is assumed
                var uidForPostMessage = this.getPath(href);
                this.uidForPostMessage = this.getPath(href);
                this.setupPostMessage(uidForPostMessage);
            }
            else {
                this.data.height = this.staticHeight;
                this.elm.scrolling = 'yes';
            }
        },
        onBbcDomain: function () {
            return window.location.host.search('bbc.co') > -1;
        },
        setupPostMessage: function (uid) {
            var iframeWatcher = this;
            this.onEvent(window, 'message', function (e) {
                iframeWatcher.postMessageCallback(e.data);
            });
        },
        postMessageCallback: function (data) {
            if (this.postBackMessageForThisIframe(data)) {
                this.processCommunicationFromIframe(
                    this.getObjectNotationFromDataString(data)
                );
                if (this.istatsInTheData()) {
                    this.addToIstatsQueue();
                    this.emptyThisIstatsQueue(this.istatsQueue);
                }
                if (this.scrollInTheData()) {
                    if (this.data.instant) {
                        this.scrollToInstant(this.data.scrollPosition);
                    } else {
                        this.scrollToAnimated(this.data.scrollPosition, this.data.scrollDuration);
                    }
                }
            }
        },
        postBackMessageForThisIframe: function (data) {
            return data && (data.split('::')[0] === this.uidForPostMessage);
        },
        getObjectNotationFromDataString: function (data) {
            return JSON.parse(data.split('::')[1]);
        },
        istatsInTheData: function () {
            return this.data.istats && this.data.istats.actionType;
        },
        scrollInTheData: function () {
            return (typeof(this.data.scrollPosition) !== 'undefined');
        },
        addToIstatsQueue: function () {
            this.istatsQueue.push({
                'actionType': this.data.istats.actionType,
                'actionName': this.data.istats.actionName,
                'viewLabel':  this.data.istats.viewLabel
            });
        },
        processCommunicationFromIframe: function (data) {
            this.data = data;
            this.setDimensions();
            this.getAnyInstructionsFromIframe();
        },
        istatsQueueLocked: false,
        emptyThisIstatsQueue: function (queue) {
            var istatCall;
            if (this.istats && queue) {
                this.istatsQueueLocked = true;
                for (var i = 0, len = queue.length; i < len; i++) {
                    istatCall = queue.pop();
                    this.istats.log(istatCall.actionType, istatCall.actionName, {'view': istatCall.viewLabel});
                }
                this.istatsQueueLocked = false;
            }
        },
        hostIsNewsApp: function (token) {
            return (token.indexOf('bbc_news_app') > -1);
        },
        getIframeContentHeight: function () {
            if (this.data.height) {
                this.lastRecordedHeight = this.data.height;
            }
            return this.lastRecordedHeight;
        },
        setDimensions: function () {
            this.elm.width  = this.elm.parentNode.clientWidth;
            this.elm.height = this.getIframeContentHeight();
        },
        getAnyInstructionsFromIframe: function () {
            if (
                this.data.hostPageCallback &&
                (!this.iframeInstructionsRan)
            ) {
                this.iframeInstructionsRan = true;
            }
        },
        getPath: function (url) {
            var urlMinusProtocol = url.replace('http://', '');
            return urlMinusProtocol.substring(urlMinusProtocol.indexOf('/')).split('?')[0];
        },
        getWindowLocationOrigin: function () {
            if (window.location.origin) {
                return window.location.origin;
            }
            else {
                return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            }
        },
        getScrollY: function () {
            return window.pageYOffset || document.body.scrollTop || 0;
        },
        scrollToInstant: function (iframeScrollPosition) {
            var scrollPosition = this.elm.getBoundingClientRect().top + iframeScrollPosition;
            window.scrollTo(0, scrollPosition);
        },
        scrollToAnimated: function (iframeScrollPosition, scrollDuration) {
            var self = this;

            var scrollY = this.getScrollY(),
                scrollPosition = this.elm.getBoundingClientRect().top + iframeScrollPosition;

            var scrollStep = (scrollPosition - scrollY) / (scrollDuration / 15);

            /* Timeout to cancel if something wierd happens  - prevent infinite loops */
            var timeout = false;
            setTimeout(function () { timeout = true; }, scrollDuration * 2);

            var scrollInterval = setInterval(function () {
                scrollY = self.getScrollY();
                if (scrollY <= scrollPosition && !timeout) {
                    window.scrollBy(0, scrollStep);
                } else {
                    clearInterval(scrollInterval);
                }
            }, 15);
        },
        getQueryStringValue: function (name) {
            var queryString = '<!--#echo var="QUERY_STRING" -->';
            var regex = new RegExp('(?:[\\?&]|&amp;)' + name + '=([^&#]*)'),
                results = regex.exec(queryString);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        },
        removeElementFromHostPage: function (tagName, attrName, attrValue) {
            var element;
            if (typeof document.querySelector !== 'undefined') {
                element = document.querySelector(tagName + '[' + attrName + '*="' + attrValue + '"]');
                if (element) {
                    element.parentNode.removeChild(element);
                }
            } else {
                // Support for older browsers
                element = document.getElementsByTagName(tagName);
                for (var idx = 0; idx < element.length; ++idx) {
                    if (element[idx][attrName].indexOf(attrValue) >= 0) {
                        element[idx].parentNode.removeChild(element[idx]);
                    }
                }
            }
        },
        removeAppWebViewLinksFromHostPage: function () {
            this.removeElementFromHostPage('a', 'href', window.location.pathname);
        },
        removeFallbackImageFromHostPage: function () {
            var imageName = this.getQueryStringValue('fallback');
            if (imageName) {
                this.removeElementFromHostPage('img', 'src', imageName);
            }
        }
    };

    function cutsTheMustard() {
        
        var modernDevice =
                document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1') &&
                'querySelector' in document &&
                'localStorage' in window &&
                'addEventListener' in window,
            atLeastIE8   = !!(document.documentMode && (document.documentMode >= 8));

        return modernDevice || atLeastIE8;
    }

    if (cutsTheMustard()) {
        var iframe = new IframeWatcher('<%= iframeUid %>');
    }

})();
