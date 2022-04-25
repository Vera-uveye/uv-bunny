import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BunnyDetailsComponent } from './bunny-details/bunny-details.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'details', component: BunnyDetailsComponent },
  { path: 'configs', component: ConfigurationsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
