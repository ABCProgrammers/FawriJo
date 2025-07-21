import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { TermAndConditionsComponent } from "./term-and-conditions/term-and-conditions.component";
const routes: Routes = [
  { path: "privacy", component: PrivacyPolicyComponent },
  { path: "terms-conditions", component: TermAndConditionsComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoPagesRoutingModule { }
