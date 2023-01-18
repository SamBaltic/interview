//console.log(SF.currentValues); 

SF.registerPlaceholder('Placeholder4TextModulesPicker', () => {
    const slot = 'selector-example-selection';
    const previousSelection = SF.customFormState[slot];  // load previously stored state

    return (
        SF.react.createElement(MyCustomSelector, {
            selectedOptions: previousSelection,
            onChange: (newSelection) => {
                SF.customFormState[slot] = newSelection;  // store state
            }
        })
    );
});

//  get the data from the list TextModule per SharePoint REST 
`endpoint: https://sxdev.sharepoint.com/sites/psbg-assessment-center-en/_api/web/lists(guid'd128b625-6902-462e-88fc-3d1aef9dc8e2')/items?$select=Id,ModuleContent,ModuleType,Title`

// create a picker component from title and moduletype. 

//Set the values from the picker in the necessary places, sort the result  --> cTextContent, cTextModuleID, cTextModuleType, cTextModuleTitle  -> Internal names of the columns in SharePoint
// Example: let textContext = SF.setFieldValue('cTextContent', 'hello world');  


async function getTextModlues(url) {
    return new Promise(function (resolve, reject) {
        var request = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        request.addEventListener("load", function(event) {
            if (event.target.readyState === 4 && event.target.status === 200) {
                resolve(JSON.parse(event.target.responseText).value);
            } else {
                reject(event.target.status);
            }
        });
        request.addEventListener("error", function(event) {
            console.log('error getTextModules: ', event);        
        });
        request.open("GET", url, true);
        request.setRequestHeader("Accept", "application/json;odata=nometadata");
        request.send();
    });
}

function MyCustomSelector(props) {
    const [ currentSelection, setCurrentSelection ] = SF.react.useState();  // self-managed but announced, initially from props

    // whenever new selectedOptions were provided from outside, update our own managed currentSelection with it:
    SF.react.useEffect(() => {
        setCurrentSelection(props.selectedOptions);
    }, [ props.selectedOptions ]);

    // render:
    const selector = SF.react.createElement(SF.controlTypes.Selector,
    {
        options: undefined,  // static options (known already)

        resolveOptions: loadOptions,  // alternatively dynamic options - a callback to load options (at the time when needed)
        resolveOnInput: false,  // whether to call resolveOptions again and again when the input text changes (debounced)
        resolveAlways: false,  // whether to call resolveOptions every time the user opens the dropdown (in case of external dependencies)
        resolveOptionsTrigger: undefined,  // can be used to explicitly trigger a new call to resolveOptions (e.g. incremented number or new {} object)
        inputTimeout: 500,  // debounce timeout

        selectedOptions: currentSelection,  // array of the currently selected options (will pick these by key from the resolved options)
        //selectedKeys: currentSelection,  // alternatively array of the keys (requires options with corresponding keys to display text)

        onChange: onOptionsChanged,  // callback to commit changes
        //onInput: (newText, isAfterDebounce) => {  },  // callback whenever the input text changes (see also resolveOnInput)
        //onFocus: () => {  }, onBlur: () => {  },  // callbacks for entering and exiting
        //checkActivate: () => { return false; },  // callback to determine whether the Selector should take the focus
        //renderOption: (o, inputText, fnRenderDefault, isInMenu) => {  // custom rendering
        //    return SF.react.createElement('span', { style: { border: 'solid 1px red' } }, fnRenderDefault());
        //}

        multiSelect: false,  // multiple values (or none) can be picked
        allowClear: false,  // whether to show an X to clear all value(s)
        allowFillIn: false,  // user can add further custom values by typing text
        fillInMode: 'create',  // 'create' (input text has to be committed explicitly by adding a new option) or 'combobox' (free-text input is committed automatically as a single new value)

        disabled: false,  // non-interactive
        invalid: false,  // highlighted in red

        noResultsText: undefined,  // custom text if there are no options
        placeholderText: SF.localize({ en: "Select your options", de: "Wählen Sie Ihre Optionen" }),  // custom text if empty
        loadingText: undefined,  // custom text while loading

        filterMode: 'contains',  // how to filter the options when the user enters text ('contains' | 'startsWith' | 'none')
        filterResetMode: 'selection',  // when the filter text is reset (default is after `selection`, alternatively after 'menuclose' | 'blur' | 'never' to preserve it longer)
    });

    return selector;  // component's render output

   //Code comes here... 
}



function MyCustomSelector(props) {
    const [ currentSelection, setCurrentSelection ] = SF.react.useState();  // self-managed but announced, initially from props
    const [options, setOptions] = SF.react.useState([]);

    SF.react.useEffect(() => {
        setCurrentSelection(props.selectedOptions);
    }, [ props.selectedOptions ]);

    const loadOptions = async (inputText) => {
        // Get all options from the API
        const allOptions = await getTextModules(url);
        // Filter the options based on title and moduletype
        const filteredOptions = allOptions.filter(option => option.title.includes(inputText) || option.moduletype.includes(inputText));
        setOptions(filteredOptions);
    }

    // render:
    const selector = SF.react.createElement(SF.controlTypes.Selector,
    {
        options: options,  // dynamic options loaded by loadOptions function
        resolveOptions: loadOptions,  // call loadOptions function to get options
        resolveOnInput: true,  // call loadOptions function when user types in the input
        selectedOptions: currentSelection,  // array of the currently selected options
        onChange: onOptionsChanged,  // callback to commit changes
    });

    return selector;
}