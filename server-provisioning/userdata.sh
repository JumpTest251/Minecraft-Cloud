#cloud-config

runcmd:
  - ufw --force enable
  - ufw allow ssh
