
<script setup lang="ts">
import { type Ref } from 'vue';
import { useForgotPasswordController } from '../../services/Frm_Login/Frm_ResetPasswordController.ts';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';


const visible = defineModel<boolean>('visible');


const {
  username,
  loading,
  handleRequestReset
} = useForgotPasswordController(visible as Ref<boolean>);
</script>