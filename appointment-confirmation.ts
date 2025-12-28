export function appointmentEmail(
  name: string,
  date: string,
  service: string
) {
  return `
<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif;">
    <p>Hi ${name},</p>
    <p>Your <strong>${service}</strong> is scheduled for <strong>${date}</strong>.</p>
    <p>Thanks,<br/>KasaGlow Cleaning</p>
  </body>
</html>
`;
}
