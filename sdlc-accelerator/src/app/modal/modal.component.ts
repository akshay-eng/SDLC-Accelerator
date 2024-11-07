
import { Component, Inject, Input} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseModal, ModalService, ModalModule, InputModule} from 'carbon-components-angular';
import { APIServiceService } from '../service/apiservice.service';

@Component({
  selector: 'app-sample',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [ModalModule, InputModule, FormsModule],
})
export class ModalComponent extends BaseModal{
  constructor(
    @Inject("data") public data:any,
		@Inject("inputValue") public inputValue:any,
		protected modalService: ModalService) {
		super();
	}
  @Input() disabled = true
  notificationShow = false
	onChange(event:any) {
    this.inputValue = event.target.value
    this.disabled = this.inputValue.trim() === ''
	}

  createJob() {
    this.data.next(this.inputValue);
    this.closeModal()
  }
}