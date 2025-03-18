import { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Grid,
    Avatar,
} from '@mui/material';
import Icon from './Icon';
import axiosInstance from '../utils/axios';
import { DatePicker } from '@mui/x-date-pickers';
import toast from 'react-hot-toast';

function CreateUser() {
    const [fields, setFields] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState({id: null,value: null});
    const [error, setError] = useState(null);
    const [formData,setFormData] = useState(null);
    let metaDataResponse = null;
    useEffect(() => {
        async function fetchUserMetaData() {
            try {
                 // eslint-disable-next-line react-hooks/exhaustive-deps
                 metaDataResponse = await axiosInstance.get('/metadata/users');
                if (metaDataResponse.data.success) {
                    setFields(metaDataResponse.data.data);
                    setError(null);
                    const initialFormData = {};
                    Object.keys(metaDataResponse.data.data).map((key)=>{
                        const field = metaDataResponse.data.data[key];
                        if(field.create && field.type!="image" && field.type!="pdf"){
                            initialFormData[field.id]="";
                        }
                    })
                    setFormData(initialFormData);
                }
            } catch (error) {
                console.error(error);
                setError("An error occurred while fetching metadata");
            }
        }
        fetchUserMetaData();
    }, []);

    const handleChange = (id,value)=>{
        console.log(value);
        
        setFormData(prev=>{ return {
            ...prev,
            [id]: value
        }})
    }

    const handleSubmit = async(event) => {
        event.preventDefault();
        const formValues = new FormData();
        Object.keys(formData).forEach(key => {
            formValues.append(key, formData[key]);
        });
        if (profilePhoto) {
            formValues.append("profile_pic", new FormData(event.target).get("profile_pic"));
        }
        console.log(formValues);
        
        try {
            const response = await axiosInstance.post("/user/create", formValues);
            if (response.data.success) {
                toast.success(response.data.message);
                event.target.reset();
                const initialFormData = {};
                Object.keys(metaDataResponse.data.data).map((key)=>{
                    const field = metaDataResponse.data.data[key];
                    if(field.create && field.type!="image" && field.type!="pdf"){
                        initialFormData[field.id]="";
                    }
                })
                setFormData(initialFormData);
                setProfilePhoto({id: null,value: null});
            }
        } catch (error) {
            const errorObject = error?.response?.data?.errors;
            console.log(errorObject);
            if(errorObject){
                toast.error(errorObject.message);
            }
        }
        
    };


    {
        return error ? (<Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom></Typography>
            <Paper sx={{ p: 3 }}>
                <Typography variant="body1">{error}</Typography>
            </Paper>
        </Box>) : fields && <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Create User</Typography>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* User Details */}
                    {
                    Object.keys(fields).map((key) => {
                        const field= fields[key];
                        return(
                         field.create &&
                        <Grid item xs={12} md={6} key={field.id} sx={{ mb: 2, width: '50%' }}>
                            {field.type === 'select' ? (
                                <FormControl fullWidth>
                                    <InputLabel>{field.label}</InputLabel>
                                    <Select
                                        label={field.label}
                                        required={field.required}
                                        onChange={(e)=>{handleChange(field.id,e.target.value)}}
                                        value={formData[field.id]}
                                        name={field.id}
                                    >
                                        {field.options?.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : field.type === 'date' ? (
                                <DatePicker
                                    label={field.label}
                                    name={field.id}
                                    onChange={(newValue)=>{handleChange(field.id,newValue.$d)}}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: field.required,
                                        },
                                    }}
                                />
                            ) : field.type === 'textarea' ? (
                                <TextField
                                    fullWidth
                                    label={field.label}
                                    name={field.id}
                                    multiline
                                    rows={4}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    required={field.required}
                                />
                            ) : field.type === 'image' ? (
                                <Box sx={{ display: "flex", gap: 2 }}>
                                <Avatar
                                    src={profilePhoto || undefined}
                                    sx={{ width: 50, height: 50 }}
                                />
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<Icon name="upload" size={18} />}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Upload Photo
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        name={field.id}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setProfilePhoto(reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </Button>
                            </Box>
                                
                            ) : (
                                <TextField
                                    fullWidth
                                    label={field.label}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    required={field.required}
                                />
                            )}
                        </Grid>
                    )})}


                    {/* </Grid>  */}


                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined">Cancel</Button>
                            <Button type="submit" variant="contained">Create User</Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    }
}

export default CreateUser;
