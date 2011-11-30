jQuery autoComplete
===================
This is a rewrite of `LakTEK <http://laktek.com>`_'s `smartAutoComplete <https://github.com/laktek/jQuery-Smart-Auto-Complete>`_ plugin.
::

    $('#example1').autoComplete({
        delay: 125,
        formatResult: function(x) {return /an/.test(x) ? '<b>' + x + '</b>' : x},
        maxResultCount: 5,
        minCharacterCount: 1,
        separator: ',',
        source: ['Avocado', 'Banana', 'Orange', 'Mango']
    }).focus();

The ``source`` parameter can also be javascript code that returns a list.  This is useful if you want to update the contents of the list dynamically.
::

    var fruits1 = ['Apple', 'Banana', 'Blueberry', 'Grapefruit', 'Orange', 'Strawberry'];
    var fruits2 = ['Avocado', 'Guava', 'Kiwi', 'Mango', 'Papaya', 'Pineapple', 'Pomegranate'];
    var fruits = fruits1;

    $('#example1').autoComplete({
        source: 'fruits'
    }).focus();
