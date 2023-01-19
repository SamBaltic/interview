// 1. get values
SF.registerPlaceholder('Placeholder4TextModulesPicker', () => {
    const slot = 'selector-example-selection';
    const previousSelection = SF.customFormState[slot];

    return (
        SF.react.createElement(MyCustomSelector, {
            selectedOptions: previousSelection,
            onChange: (newSelection) => {
                SF.customFormState[slot] = newSelection;
                const selectedTextModule = getTextModules().then(data => {
                    return data.find(item => item.ID === newSelection[0].key);
                });
               let content = SF.setFieldValue('cTextContent', selectedTextModule.ModuleContent);
                let id = SF.setFieldValue('cTextModuleID', selectedTextModule.ID);
               let type =  SF.setFieldValue('cTextModuleType', selectedTextModule.ModuleType);
              let title = SF.setFieldValue('cTextModuleTitle', selectedTextModule.Title);
            }
        })
    );
    console.log(selectedTextModule.ModuleContent);
});


// 2. get the data from the list TextModule per SharePoint REST
const endpoint = `https://sxdev.sharepoint.com/sites/psbg-assessment-center-en/_api/web/lists(guid'd128b625-6902-462e-88fc-3d1aef9dc8e2')/items?$select=Id,ModuleContent,ModuleType,Title`;
 
function getTextModules() {
    return new Promise(function (resolve, reject) {
         var request = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        request.open('GET',endpoint, true);
        request.setRequestHeader('Accept', 'application/json;odata=nometadata');
        request.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    resolve(JSON.parse(this.responseText).value);
                } else {
                    reject(this.status);
                }
            }
        };
        request.send();
    });
}

// 3. create a picker component from title and moduletype
function MyCustomSelector(props) {
    const [options, setOptions] = SF.react.useState([]);
    SF.react.useEffect(() => {
        getTextModules().then(data => {
            const options = data.map(item => ({
                key: item.ID,
                text: item.Title,
                subtext: item.ModuleType
            }));
            setOptions(options);
        });
    }, []);
    
    const [currentSelection, setCurrentSelection] = SF.react.useState([]);
    SF.react.useEffect(() => {
        setCurrentSelection(props.selectedOptions);
    }, [props.selectedOptions]);

    const onOptionsChanged = (newSelection) => {
        setCurrentSelection(newSelection);
        props.onChange(newSelection);
    }

    return (
        SF.react.createElement(SF.controlTypes.Selector,
        {
            options: options,
            selectedOptions: currentSelection,
            onChange: onOptionsChanged
        })
    );
}

