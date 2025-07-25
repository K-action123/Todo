import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // A pleasant blue
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#fff',
        },
        secondary: {
            main: '#dc004e', // A vibrant red for contrast
            light: '#e33371',
            dark: '#9a0036',
            contrastText: '#fff',
        },
        background: {
            default: '#e0f2f7', // A very light, calming blue-grey
            paper: '#ffffff', // White for cards and lists
        },
        text: {
            primary: '#333333', // Dark grey for general text
            secondary: '#666666', // Lighter grey for secondary text
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700, // Make headings bolder
            fontSize: '2.125rem',
            lineHeight: 1.235,
            letterSpacing: '0.00735em',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        body1: {
            fontSize: '1rem',
        },
    },
    spacing: 8, // Default spacing unit in pixels (8px)

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20, // More rounded buttons
                    textTransform: 'none', // Prevent uppercase by default
                    padding: '10px 20px',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 15, // Rounded input fields
                        backgroundColor: '#fff',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ccc', // Lighter border for inputs
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#888',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2', // Primary color on focus
                    },
                },
            },
        },
        MuiList: {
            styleOverrides: {
                root: {
                    borderRadius: 15, // Rounded corners for the list container
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Soft shadow
                    overflow: 'hidden', // Ensures rounded corners apply correctly
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    padding: '12px 20px', // More padding for list items
                    borderBottom: '1px solid #f0f0f0', // Light separator
                    '&:last-child': {
                        borderBottom: 'none', // No border on the last item
                    },
                    '&.Mui-selected': { // Style for potentially selected items
                        backgroundColor: 'rgba(25, 118, 210, 0.08)', // Light blue tint
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.03)', // Subtle hover effect
                    },
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    padding: '9px', // Adjust padding for checkbox
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(220,0,78,0.05)', // Subtle hover for delete icon
                    },
                },
            },
        },
    },
});

export default theme;