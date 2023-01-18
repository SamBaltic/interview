// 1. get the data from the list TextModule per SharePoint REST
 
const getTextModules = async () => {
   const endpoint = `https://sxdev.sharepoint.com/sites/psbg-assessment-center-en/_api/web/lists(guid'd128b625-6902-462e-88fc-3d1aef9dc8e2')/items?$select=Id,ModuleContent,ModuleType,Title`;
    const response = await fetch(endpoint, {
        headers: {
            'accept': 'application/json;odata=nometadata',
            'content-type': 'application/json;odata=nometadata'
        }
    });
    const data = await response.json();
    return data.value;
}

// 2. create a picker component from title and moduletype
function MyCustomSelector(props) {
    const [options, setOptions] = SF.react.useState([]);
    SF.react.useEffect(() => {
        getTextModules().then(data => {
            const options = data.map(item => ({
                key: item.ID,
                text: item.Title,
                subtext: item.cTextModuleType
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
// 3. get values
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
                SF.setFieldValue('cTextContent', selectedTextModule.cTextContent);
                SF.setFieldValue('cTextModuleID', selectedTextModule.ID);
                SF.setFieldValue('cTextModuleType', selectedTextModule.cTextModuleType);
                SF.setFieldValue('cTextModuleTitle', selectedTextModule.Title);
            }
        })
    );
});

