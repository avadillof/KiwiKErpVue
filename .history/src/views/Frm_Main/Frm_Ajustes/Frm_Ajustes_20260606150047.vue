
<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button';
import Message from 'primevue/message';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import FloatLabel from 'primevue/floatlabel';
import Checkbox from 'primevue/checkbox';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Textarea from 'primevue/textarea';
import UsuariosTabla from '../../../components/ajustes/UsuariosTabla.vue';
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';

const router = useRouter();
const { formData, loading, saveData, provincias, loadData, onUploadLogo, baseUrl, handleImageError, handleImageLoad,openUserDialog } = Frm_Ajustes();

onMounted(() => {
  loadData();
});

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>