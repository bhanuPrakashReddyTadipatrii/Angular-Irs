import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { LicenseManager } from '@ag-grid-enterprise/core';
LicenseManager.setLicenseKey('CompanyName=Knowledge Lens LLC,LicensedGroup=Knowledge Lens LLC,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=5,LicensedProductionInstancesCount=10,AssetReference=AG-033979,SupportServicesEnd=17_October_2023_[v2]_MTY5NzQ5NzIwMDAwMA==89820b4eb12f520c96eba4fbc8c798eb');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
