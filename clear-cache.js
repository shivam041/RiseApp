// Clear cache script for Rise App
// This script helps clear any cached data that might be causing issues

console.log('Clearing Rise App cache...');

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('rise_') || key.includes('supabase') || key.includes('onesignal'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('Removing localStorage key:', key);
    localStorage.removeItem(key);
  });
  
  console.log('localStorage cleared');
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('rise_') || key.includes('supabase') || key.includes('onesignal'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('Removing sessionStorage key:', key);
    sessionStorage.removeItem(key);
  });
  
  console.log('sessionStorage cleared');
}

// Clear IndexedDB if available
if (typeof indexedDB !== 'undefined') {
  try {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        if (db.name.includes('rise') || db.name.includes('supabase') || db.name.includes('onesignal')) {
          console.log('Deleting IndexedDB database:', db.name);
          indexedDB.deleteDatabase(db.name);
        }
      });
    });
  } catch (error) {
    console.log('IndexedDB not available or error clearing:', error);
  }
}

console.log('Cache clearing completed. Please refresh the page.');
