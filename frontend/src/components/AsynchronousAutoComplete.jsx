import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import axiosInstance from "../utils/axios";
import React from "react";

export default function AsynchronousAutoComplete({
  fetchUrl,
  optionLabelFunction,
  filters = {},
  sendInputToParent,
  optionaEqualToValueFunction,
  ...props
}) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Fetch initial 10 documents when component mounts
  React.useEffect(() => {
    fetchOptions("");
  }, []);

  const fetchOptions = async (searchKey) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(fetchUrl, {
        search_key: searchKey,
        ...filters,
      });
      setOptions(response.data.data);
    } catch (error) {
      console.error("Error fetching options:", error);
      setOptions([]);
    }
    setLoading(false);
  };

  const handleInputChange = (event, newInputValue) => {
    sendInputToParent && sendInputToParent(event);
    console.log(event);
    setInputValue(newInputValue);
    
    // Check if current input matches any existing options
    const matchesExisting = options.some(option => 
      optionLabelFunction(option)
        .toLowerCase()
        .includes(newInputValue.toLowerCase())
    );
    // Sort options based on how closely they match the input
    if (matchesExisting && newInputValue.length > 0) {
      setOptions([...options].sort((a, b) => {
        const aLabel = optionLabelFunction(a).toLowerCase();
        const bLabel = optionLabelFunction(b).toLowerCase();
        const searchTerm = newInputValue.toLowerCase();
        return bLabel.indexOf(searchTerm) - aLabel.indexOf(searchTerm);
      }));
    }
    // If no matches, fetch new options from backend
    if (!matchesExisting && newInputValue.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchOptions(newInputValue);
      }, 700);
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <Autocomplete
      sx={{ width: 300 }}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={optionaEqualToValueFunction}
      getOptionLabel={optionLabelFunction}
      options={options}
      loading={loading}
      filterOptions={(x)=>x}
      onInputChange={handleInputChange}
      onChange={(event, newValue) => {
        const syntheticEvent = {
          target: {
            value: newValue
          }
        };
        sendInputToParent && sendInputToParent(syntheticEvent);
      }}
      noOptionsText={loading ? "Loading..." : "No options"}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Employee ID"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            },
          }}
        />
      )}
      {...props}
    />
  );
}