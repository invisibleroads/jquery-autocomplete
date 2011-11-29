$.fn.autoComplete = function(options) {

    function filterStrings(strings, term) {
        // Escape regular expression symbols
        var pattern = new RegExp(term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
        return $.grep(strings, function(x) {return pattern.test(x)});
    }

    options = $.extend({}, {
        delay:125,
        filter:filterStrings,
        formatResult:function(x) {return x},
        maxResultCount:10,
        minCharacterCount:2,
        separator:null,
        sourcePacks:[]
    }, options);

    // Make results container if it does not exist already
    var $results = $('#autoCompleteResults');
    if (!$results.length)
        $results = $('<ul>', {id:'autoCompleteResults', style:'display:none'}).appendTo('body');

    // Define functions for extraction and completion
    var separator = options.separator, extractTerm, replaceTerm;
    if (separator) {
        extractTerm = function(text) {
            var terms = text.split(separator);
            return $.trim(terms[terms.length - 1]);
        };
        replaceTerm = function(text, term) {
            var terms = text.split(separator);
            terms[terms.length - 1] = term;
            return $.map(terms, $.trim).join(separator) + separator;
        };
    } else {
        extractTerm = function(text) {
            return $.trim(text);
        };
        replaceTerm = function(text, term) {
            return term;
        };
    }

    return $(this).each(function() {
        var $input = $(this), oldCharacterCount, oldSelection;

        function shiftFocus(newSelection) {
            var $lis = $results.children(), maxSelection = $lis.length - 1;
            if (newSelection < 0) 
                newSelection = 0;
            else if (newSelection > maxSelection) 
                newSelection = maxSelection;
            if (oldSelection != newSelection) {
                $input.trigger('itemBlur', [$lis[oldSelection]]);
                oldSelection = newSelection;
            }
            $input.trigger('itemFocus', [$lis[newSelection]]);
        }

        $input
            .prop('autocomplete', 'off')
            .unbind('.ac')
            .bind({
                'keyup.ac':function(e) {
                    var keyCode = e.keyCode;
                    if (keyCode == 40) {
                        // DOWN
                        if (!$results.is(':visible')) return;
                        shiftFocus(oldSelection + 1);
                    } else if (keyCode == 38) {
                        // UP
                        if (!$results.is(':visible')) return;
                        shiftFocus(oldSelection - 1);
                    } else if (keyCode == 13) {
                        // ENTER
                        if (!$results.is(':visible')) return;
                        var $lis = $results.children();
                        $input.trigger('itemSelect', [$lis[oldSelection]]);
                    } else {
                        var text = $input.val(), newCharacterCount = text.length;
                        if (oldCharacterCount == newCharacterCount) return;
                        oldCharacterCount = newCharacterCount;

                        if (extractTerm(text).length >= options.minCharacterCount) {
                            setTimeout(function() {
                                $input.trigger('autoPrompt');
                            }, options.delay);
                        } else {
                            $input.trigger('inputBlur');
                        }
                    }
                },
                'keydown.ac':function(e) {
                    var keyCode = e.keyCode;
                    if (keyCode == 13) {
                        // Block ENTER to prevent form submission
                        return false;
                    } else if (keyCode == 27) {
                        // Press ESC to clear autoPrompt
                        if (!$results.is(':visible')) return;
                        $input.trigger('inputBlur');
                        return false;
                    }
                },
                'autoPrompt.ac':function() {
                    var text = $input.val();
                    var results = options.filter(options.sourcePacks, extractTerm(text)).splice(0, options.maxResultCount);
                    if (!results.length) {
                        $results.hide();
                        return;
                    }
                    $results
                        .html($.map(results, function(x) {return '<li>' + options.formatResult(x) + '</li>'}).join(''))
                        .css({
                            position:'absolute',
                            top:function() {return $input.offset().top + $input.height()},
                            left:function() {return $input.offset().left}
                        })
                        .undelegate('.ac')
                        .delegate('li', {
                            'mouseenter.ac':function() {
                                shiftFocus($(this).prevAll().length);
                            },
                            'mouseleave.ac':function() {
                                $input.trigger('itemBlur', [this]);
                            },
                            'mousedown.ac':function() {
                                $input.trigger('itemSelect', [this]);
                            }
                        })
                        .show();
                    shiftFocus(0);
                },
                'itemFocus.ac':function(e, li) {
                    $(li).addClass('autoCompleteSelection');
                },
                'itemBlur.ac':function(e, li) {
                    $(li).removeClass('autoCompleteSelection');
                },
                'itemSelect.ac':function(e, li) {
                    var text = replaceTerm($input.val(), $(li).text());
                    $input.val(text).trigger('inputBlur');
                    setTimeout(function() {
                        $input.focus();
                    }, 0);
                    oldCharacterCount = text.length;
                },
                'inputBlur.ac':function(e) {
                    $results.hide();
                }
            });

        $(document)
            .unbind('.ac')
            .bind('mouseup.ac focusin.ac', function(e) {
                $input.trigger('inputBlur');
            });
    });

};
