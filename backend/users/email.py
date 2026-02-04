from djoser import email
from .tasks import send_activation_email_task

class AsyncActivationEmail(email.ActivationEmail):
    template_name = 'email/activation.html'

    def send(self, to, *args, **kwargs):
        self.render()
        html_content = getattr(self, 'html_message', None)
        send_activation_email_task.delay(
            subject=self.subject,
            message=self.body,
            recipient_list=to,
            html_message=html_content
        )
