import 'dart:async';
import 'dart:io';

import 'package:mason/mason.dart';

import 'constants.dart';
import 'vault.dart';

Future<void> run(HookContext context) async {
  final Map<String, Project?> selectedProjects = <String, Project?>{};
  for (final environment in ['development', 'staging', 'ci', 'production']) {
    final token = runFirebaseLogin(context, environment);

    final projects = await runFirebaseProjectList(context, token);
    selectedProjects[environment] =
        chooseProject(context: context, env: environment, projects: projects);
  }

  final Map<String, String> environments =
      selectedProjects.map((key, value) => MapEntry(key, value?.id ?? ''));

  context.vars.putIfAbsent('firebaseEnvinroments', () => environments);

  if (environments.values.any((project) => project.isEmpty)) {
    context.logger.alert(
      'Remember to modify the .firebaserc file for the unconfigured environments.',
    );
  }

  final String applicationName = context.vars[kApplicationNameKey];
  final vault = Vault(Directory.current.parent.parent);
  final vaultFirebaseTokenKey =
      '${applicationName.constantCase}_FIREBASE_TOKEN';

  selectedProjects.entries.forEach((entryProject) {
    final environment = entryProject.key;
    final token = entryProject.value?.firebaseToken ?? '';

    vault.pull(environment);
    vault.addVariable(environment, vaultFirebaseTokenKey, token);
    vault.push(environment);

    context.logger
        .info('🔐 Stored $vaultFirebaseTokenKey for .env.vault $environment');
  });

  context.logger.success('Firebase configured successfully 🚀');
}

Future<List<Project>> runFirebaseProjectList(
    HookContext context, String token) async {
  final projectsTableResult = await Process.run(
    'pnpm',
    ['dlx', 'firebase-tools', 'projects:list', '--token', token],
  );

  final projectsTable = projectsTableResult.stdout.toString();

  return parseProjects(projectsTable, token);
}

String runFirebaseLogin(HookContext context, String environment) {
  return context.logger.prompt(
      'Specify firebase token for $environment (pnpm dlx firebase-tools login:ci):');
}

List<Project> parseProjects(String table, String firebaseToken) {
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
        projects.add(Project(projectDisplayName, projectId, firebaseToken));
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
  final projectsWithEmptyProject = [
    ...projects,
    Project('Choose later', '', '')
  ];

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
  final String firebaseToken;

  Project(this.displayName, this.id, this.firebaseToken);

  @override
  String toString() => 'Project Display Name: $displayName, Project ID: $id';
}
