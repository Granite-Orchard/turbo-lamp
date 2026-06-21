type InvitationEmailParams = {
  url: string;
  expiresAt: string;
};

export const invitationEmail = {
  subject: '📅 Invitation to Join a Booking',

  text: ({ url, expiresAt }: InvitationEmailParams) =>
    `
You have been invited to join a booking.

Confirm your attendance:
${url}

This invitation expires on ${expiresAt}.
`.trim(),

  html: ({ url, expiresAt }: InvitationEmailParams) =>
    `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0; padding:0; background-color:#FFFBEB;">
    
    <!-- Preheader -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
      Confirm your booking invitation before it expires.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFBEB;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:8px; font-family:Arial, sans-serif;">
            
            <!-- Header -->
            <tr>
              <td style="padding:28px 24px 20px; text-align:center; border-bottom:1px solid #eeeeee;">
                <svg width="142" height="41" viewBox="0 0 142 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.9137 21.8925C17.345 31.9528 10.2175 38.6017 4.99401 36.7432C-0.229501 34.8847 -1.57103 25.2226 1.99764 15.1622C5.5663 5.1019 12.6938 -1.54701 17.9173 0.31149C23.1408 2.16999 24.4823 11.8321 20.9137 21.8925Z" fill="#9BFFAC"/>
                <path d="M32.0024 25.8378C28.4337 35.8981 21.3062 42.547 16.0827 40.6885C10.8592 38.83 9.51768 29.1679 13.0863 19.1075C16.655 9.04721 23.7825 2.3983 29.006 4.25679C34.2295 6.11529 35.571 15.7774 32.0024 25.8378Z" fill="#DCC5FF"/>
                <path d="M22.2344 5.74239C23.4311 9.89597 23.0672 15.8215 20.9137 21.8925C18.7601 27.9634 15.3097 32.7908 11.7647 35.2573C10.5682 31.1037 10.9329 25.1783 13.0863 19.1075C15.2398 13.0368 18.6896 8.20899 22.2344 5.74239Z" fill="white"/>
                <path d="M59.4899 7.52548C59.4899 7.52548 50.7336 27.5803 47.344 22.496C44.0959 17.6237 46.4966 7.52548 46.4966 7.52548H40V33.512H48.1914L65.9865 7.52548H59.4899Z" fill="currentColor"/>
                <path d="M133.588 8.10084C137.627 6.04445 141.686 6.23183 141.686 12.3273V34.0769H135.19C135.197 34.0473 137.586 23.9715 134.342 19.1064C130.956 14.0272 122.213 34.0376 122.196 34.0769H115.7V8.09036H122.196V18.259C122.202 18.2539 124.757 16.0811 128.128 12.3273C129.574 10.7166 131.482 9.20688 133.408 8.19463L133.495 8.09036L133.588 8.10084Z" fill="currentColor"/>
                <path d="M81.6662 24.3967H87.1714C85.8402 30.1116 81.5504 34.077 75.0104 34.077C67.1392 34.077 61.4673 29.0036 61.4673 20.8978C61.4673 12.7921 67.1971 6.9606 74.8368 6.9606C83.171 6.9606 87.4538 12.7921 87.4538 19.7899V22.2974H68.2967C68.5282 26.0879 71.4799 28.7703 75.2419 28.7703C78.6566 28.7703 80.6823 27.3125 81.6662 24.3967ZM68.4125 17.9238H80.6823C80.4508 14.9497 78.6566 12.0923 74.7789 12.0923C70.959 12.0923 69.0491 14.7165 68.4125 17.9238Z" fill="currentColor"/>
                <path d="M108.782 24.3967H114.288C112.956 30.1116 108.667 34.077 102.127 34.077C94.2554 34.077 88.5835 29.0036 88.5835 20.8978C88.5835 12.7921 94.3133 6.9606 101.953 6.9606C110.287 6.9606 114.57 12.7921 114.57 19.7899V22.2974H95.4129C95.6444 26.0879 98.5961 28.7703 102.358 28.7703C105.773 28.7703 107.798 27.3125 108.782 24.3967ZM95.5287 17.9238H107.798C107.567 14.9497 105.773 12.0923 101.895 12.0923C98.0752 12.0923 96.1653 14.7165 95.5287 17.9238Z" fill="currentColor"/>
                </svg>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  
                  <tr>
                    <td style="font-size:14px; line-height:1.6; color:#333333; padding-bottom:20px;">
                      You have been invited to join a booking.
                    </td>
                  </tr>

                  <!-- Button -->
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td bgcolor="#dfa233" style="border-radius:6px;">
                            <a href="${url}"
                               style="display:inline-block; padding:12px 20px; color:#333333; font-size:14px; font-weight:bold; text-decoration:none; border-radius:6px;">
                              Confirm Attendance
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="font-size:13px; color:#555555; padding-bottom:20px;">
                      This invitation expires on <strong>${expiresAt}</strong>.
                    </td>
                  </tr>

                  <tr>
                    <td style="border-top:1px solid #eeeeee; font-size:0; line-height:0;" height="1"></td>
                  </tr>

                  <tr>
                    <td style="font-size:12px; color:#777777; padding-top:16px;">
                      If the button does not work, use this link:
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top:8px; word-break:break-all;">
                      <a href="${url}" style="font-size:12px; color:#2563eb; text-decoration:none;">
                        ${url}
                      </a>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px; text-align:center; font-size:11px; color:#999999; border-top:1px solid #eeeeee;">
                This is an automated message. Do not reply.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
</html>
`.trim(),
};
