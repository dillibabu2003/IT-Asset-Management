export function convertSnakeCaseToPascaleCase(str) {
    if(!str){
        return '';
    }
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
export function convertPascaleCaseToSnakeCase(str) {
    if(!str){
        return '';
    }
    str = str.replace(/\s+/g, '_');
    return str.toLowerCase();
}
export function convertExpiryToReadable(expiry){
     const now = new Date();
     if(!expiry){
         return 'N/A';
        }
    const end = new Date(expiry);
     if(end<=now){
        return '0 days';
     }
    const diff = Math.abs(end - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = Math.floor(days % 30);
    let result = [];
    if (years > 0) result.push(`${years} years`);
    if (months > 0) result.push(`${months} months`);
    if (remainingDays > 0) result.push(`${remainingDays} days`);
    return result.join(', ');
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