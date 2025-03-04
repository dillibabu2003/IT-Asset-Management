export function convertSnakeCaseToPascaleCase(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
export function getColorAndBackgroundColorByStatus(status){
    switch(status){
        case 'available':
            return ['#F0FDF4','#15803D'];
        case 'deployed':
            return ['#E0F7FA', '#00796B'];
        case 'archived':
            return ['#F5F5F5', '#9E9E9E'];
        case 'reissue':
            return ['#FFF3E0', '#FB8C00'];
        case 'pending':
            return ['#FEF3C7', '#F59E0B'];
        case 'rejected':
            return ['#FEE2E2', '#DC2626'];
        case 'processed':
            return ['#E0E7FF', '#4338CA'];
        case 'activated':
            return ['#E3F2FD', '#1E88E5'];
        case 'expired':
            return ['#FFEBEE', '#D32F2F'];
        case 'renewed':
            return ['#E8F5E9', '#388E3C'];
        case 'about_to_expire':
            return ['#FFFDE7', '#FBC02D'];
        default:
            return ['#ffffff','#6B7280'];
    }
}