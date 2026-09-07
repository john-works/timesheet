<?php
// Usage: php ad_pw_probe.php <username> <newpassword>   (run right after you change the pw in AD)
// Polls LDAP bind with the NEW password every 2s and reports the FIRST time it succeeds,
// and how long that took from the script start.
require __DIR__ . '/vendor/autoload.php';
use Laminas\Ldap\Ldap;
$username=$argv[1]??null; $password=$argv[2]??null;
if(!$username||!$password){ fwrite(STDERR,"Usage: php ad_pw_probe.php <username> <newpassword>\n"); exit(2);}
$opt=['host'=>'192.168.33.8','port'=>389,'useStartTls'=>false,'useSsl'=>false,
 'username'=>'CN=itop_user,OU=Service Accounts,DC=ppda,DC=go,DC=ug','password'=>'ppda2016*',
 'bindRequiresDn'=>true,'baseDn'=>'dc=ppda,dc=go,dc=ug'];
$start=microtime(true);
echo "Polling bind for '$username' with the NEW password... (run right after changing the pw in AD)\n";
for($i=1;$i<=120;$i++){
  $nowT=gmdate('H:i:s');
  try{
    $ldap=new Ldap($opt); $ldap->bind();
    // resolve the user's DN
    $dn=null;
    $sam=strtok($username,'@');
    $e=$ldap->searchEntries("(&(objectClass=user)(samaccountname=".ldap_escape($sam,'',LDAP_ESCAPE_FILTER)."))",'dc=ppda,dc=go,dc=ug',Ldap::SEARCH_SCOPE_SUB,['dn']);
    if(count($e)>0) $dn=$e[0]['dn'];
    $ok=false;
    if($dn){
      try{ $d2=new Ldap($opt); $r=$d2->bind($dn,$password); $ok=(bool)$r; }
      catch(Exception $ex){ $ok=false; }
    }
    if($ok){
      $elapsed=round(microtime(true)-$start,1);
      echo "SUCCESS at iteration $i, time $nowT, after {$elapsed}s from start.\n";
      exit(0);
    }
    echo "[$nowT] #$i new pw not yet accepted\n";
  }catch(Exception $ex){ echo "[$nowT] #$i err: ".substr($ex->getMessage(),0,50)."\n"; }
  sleep(2);
}
echo "TIMED OUT after ~4 min: new password was never accepted.\n";
