import 'dart:async';
import 'dart:io';

import 'package:mason/mason.dart';

import 'constants.dart';
import 'vault.dart';

Future<void> run(HookContext context) async {
  final token = runFirebaseLogin(context);

  final projects = await runFirebaseProjectList(context, token);

  final envinroments = <String, String>{
    'development': chooseProject(
          context: context,
          env: 'development',
          projects: projects,
        )?.id ??
        '',
    'staging': chooseProject(
          context: context,
          env: 'staging',
          projects: projects,
        )?.id ??
        '',
    'production': chooseProject(
          context: context,
          env: 'production',
          projects: projects,
        )?.id ??
        '',
  };

  context.vars.putIfAbsent('firebaseEnvinroments', () => envinroments);

  if (envinroments.values.any((project) => project.isEmpty)) {
    context.logger.alert(
      'Remember to modify the .firebaserc file for the unconfigured environments.',
    );
  }

  final String applicationName = context.vars[kApplicationNameKey];
  final vault = Vault(Directory.current.parent.parent);
  final vaultFirebaseTokenKey = '${applicationName.constantCase}_FIREBASE_TOKEN';

  ['staging', 'production'].forEach((environment) {
    vault.pull(environment);
    vault.addVariable(environment, vaultFirebaseTokenKey, token);
    vault.push(environment);
    context.logger.info('🔐 Stored $vaultFirebaseTokenKey for .env.vault $environment');
  });

  context.logger.success('Firebase configured successfully 🚀');
}

Future<List<Project>> runFirebaseProjectList(HookContext context, String token) async {
  final projectsTableResult = await Process.run(
    'pnpm',
    ['dlx', 'firebase-tools', 'projects:list', '--token', token],
  );

  final projectsTable = projectsTableResult.stdout.toString();

  return parseProjects(projectsTable);
}

String runFirebaseLogin(HookContext context) {
  return context.logger.prompt('Specify firebase token (pnpm dlx firebase-tools login:ci):');
}

List<Project> parseProjects(String table) {
  List<Project> projects = [];
  List<String> lines = table.split('\n');

  // Trova le righe con i dati
  for (var line in lines) {
    if (line.contains('│')) {
      List<String> columns = line.split('│').map((col) => col.trim()).toList();
      if (columns.length > 2 && columns[1] != 'Project Display Name') {
        String projectDisplayName = columns[1];
        String projectId = columns[2]
            .replaceAll(' (current)', ''); // Rimuove "(current)" se presente
        projects.add(Project(projectDisplayName, projectId));
      }
    }
  }

  return projects;
}

Project? chooseProject({
  required HookContext context,
  required String env,
  required List<Project> projects,
}) {
  final projectsWithEmptyProject = [...projects, Project('Choose later', '')];

  final choosed = context.logger.chooseOne<Project>(
    "Choose project for $env",
    choices: projectsWithEmptyProject,
    display: (choice) => choice.displayName,
  );

  if (choosed.id.trim().isEmpty) {
    return null;
  }

  return choosed;
}

class Project {
  final String displayName;
  final String id;

  Project(this.displayName, this.id);

  @override
  String toString() => 'Project Display Name: $displayName, Project ID: $id';
}
