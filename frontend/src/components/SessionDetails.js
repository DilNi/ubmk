import React from 'react';
import api from '../services/api';

function SessionDetails({ session }) {
    const handleDownloadPDF = async () => {
        try {
            // PDF'i indir
            const response = await api.get(`/sessions/pdf/${session.title}`, {
                responseType: 'blob',
            });

            // Tarayıcıda indirme işlemi başlat
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${session.title}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('PDF indirilemedi:', error);
            alert('PDF indirilemedi. Sunucuya bağlanılamıyor.');
        }
    };

    return (
        <div className="session-details">
            <h2>{session.title}</h2>
            <p><strong>Açıklama:</strong> {session.description}</p>
            {session.pdf && (
                <button onClick={handleDownloadPDF} className="download-pdf-button">
                    PDF İndir
                </button>
            )}
            {!session.pdf && (
                <p>Bu oturum için PDF bulunmamaktadır.</p>
            )}
        </div>
    );
}

export default SessionDetails;
