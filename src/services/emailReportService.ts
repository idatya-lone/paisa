export async function sendMonthlyReportEmail({
  month,
  email,
  workbookBuffer,
}: {
  month: string;
  email: string;
  workbookBuffer: ArrayBuffer;
}) {
  try {
    const payload = {
      month,
      email,
      workbookBase64: btoa(String.fromCharCode(...new Uint8Array(workbookBuffer))),
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/send-monthly-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Email service failed.');
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Unable to send monthly report email.',
    );
  }
}
