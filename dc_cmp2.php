<?php
require __DIR__ . '/vendor/autoload.php';
use Laminas\Ldap\Ldap;
$base=['username'=>'CN=itop_user,OU=Service Accounts,DC=ppda,DC=go,DC=ug','password'=>'ppda2016*','bindRequiresDn'=>true,'baseDn'=>'dc=ppda,dc=go,dc=ug'];
$username=$argv[1]??'jssekamatte';
foreach(['192.168.33.8'=>'PRIMARY','192.168.34.8'=>'SECONDARY'] as $ip=>$label){
  $o=array_merge($base,['host'=>$ip,'port'=>389,'useStartTls'=>false,'useSsl'=>false]);
  try{
    $ldap=new Ldap($o); $ldap->bind();
    $e=$ldap->searchEntries("(&(objectClass=user)(samaccountname=".ldap_escape($username,'',LDAP_ESCAPE_FILTER)."))",'dc=ppda,dc=go,dc=ug',Ldap::SEARCH_SCOPE_SUB,['+','*']);
    if(count($e)>0){
      $when=$e[0]['whenchanged'][0]??'n/a';
      echo "[$label $ip] whenChanged=$when\n";
    } else echo "[$label $ip] USER NOT FOUND\n";
  }catch(Exception $ex){ echo "[$label $ip] ERR: ".substr($ex->getMessage(),0,80)."\n"; }
}
